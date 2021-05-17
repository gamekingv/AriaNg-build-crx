const fs = require('fs').promises;
const got = require('got');
const { promisify } = require('util');
const stream = require('stream');
const pipeline = promisify(stream.pipeline);


const {
  GITHUB_RUN_ID: run_id,
  GITHUB_REPOSITORY: repository,
  GITHUB_TOKEN: token
} = process.env;

const sourceRepo = 'mayswind/AriaNg';

const client = got.extend({
  headers: {
    'User-Agent': 'Github Actions'
  },
  timeout: 10000,
  responseType: 'json'
});

async function cancelWorkflow() {
  await client.post(`https://api.github.com/repos/${repository}/actions/runs/${run_id}/cancel`, {
    headers: {
      'Accept': 'application/vnd.github.v3+json',
      'Authorization': `token ${token}`
    }
  });
}

(async () => {
  try {
    const { body: sourceRelease } = await client.get(`https://api.github.com/repos/${sourceRepo}/releases/latest`);
    console.log(sourceRelease.tag_name);
    const { body: release } = await client.get(`https://api.github.com/repos/${repository}/releases/latest`);
    if (sourceRelease.tag_name === release.tag_name) {
      await cancelWorkflow();
      await new Promise(res => setTimeout(() => res(), 60000));
    }
    const assetsURL = sourceRelease.assets_url;
    const { body: assets } = await client.get(assetsURL);
    const asset = assets.filter(asset => !asset.name.includes('AllInOne'))[0];
    if (!asset) throw '获取源文件失败';
    const downloadURL = asset.browser_download_url;
    await pipeline(
      got.stream(downloadURL),
      fs.createWriteStream('source.zip')
    );
    const manifest = JSON.parse(await fs.readFile('source/manifest.json'));
    manifest.update_url = `https://github.com/${repository}/releases/latest/download/update.xml`;
    manifest.version = sourceRelease.tag_name;
    await fs.writeFile('source/manifest.json', JSON.stringify(manifest, null, 2));
  }
  catch (error) {
    if (!error.response || error.response.statusCode !== 404) {
      console.log(error);
      console.log(error.response.body);
      process.exit(1);
    }
  }
})();