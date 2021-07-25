const fs = require('fs').promises;

const {
  GITHUB_REPOSITORY: repository
} = process.env;

(async () => {
  try {
    
    const manifest = JSON.parse(await fs.readFile('source/manifest.json'));
    manifest.update_url = `https://github.com/${repository}/releases/latest/download/update.xml`;
    await fs.writeFile('source/manifest.json', JSON.stringify(manifest, null, 2));
    const html = (await fs.readFile('source/index.html')).toString();
    const result = html
      .replace('</ul></li><li class="divider"></li><li><a class="toolbar"', '</ul></li><li class="divider"></li><li class="disabled" ng-class="{\'disabled\': !isTaskSelected()}" ng-controller="combineVideo"><a class="toolbar" title="合并视频" ng-click="combineSelectedVideo()"><i class="fa fa-compress"></i></a></li><li class="divider"></li><li><a class="toolbar"')
      .replace('></body>', '><script src="js/combine-video.js"></script></body>');
    await fs.writeFile('source/index.html', result);
    const jsFiles = await fs.readdir('source/js');
    const angularJS = jsFiles.find(file => file.includes('angular-packages'));
    const js = (await fs.readFile(`source/js/${angularJS}`)).toString();
    await fs.writeFile(`source/js/${angularJS}`, js.replace('"unsafe:"+', ''));
  }
  catch (error) {
    console.log(error);
    process.exit(1);
  }
})();
