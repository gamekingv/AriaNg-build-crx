const fs = require('fs').promises;

(async () => {
  try {
    const html = (await fs.readFile('source/index.html')).toString();
    const result = html
      .replace('</ul></li><li class="divider"></li><li><a class="toolbar"', '</ul></li><li class="divider"></li><li class="disabled" ng-class="{\'disabled\': !isTaskSelected()}" ng-controller="combineVideo"><a class="toolbar" title="合并视频" ng-click="combineSelectedVideo()"><i class="fa fa-compress"></i></a></li><li class="divider"></li><li><a class="toolbar"')
      .replace('></body>', '><script src="js/combine-video.js"></script></body>')
      .replace('ng-href="#!/new"', 'href="#!/new"');
    await fs.writeFile('source/index.html', result);
  }
  catch (error) {
    console.log(error);
    process.exit(1);
  }
})();
