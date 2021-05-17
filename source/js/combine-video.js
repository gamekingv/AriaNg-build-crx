(function () {
    'use strict';
    /* global angular browser*/
    angular.module('ariaNg').controller('combineVideo', ['$rootScope', '$scope', 'ariaNgNotificationService', ($rootScope, $scope, ariaNgNotificationService) => {
        $scope.combineSelectedVideo = () => {
            let tasks = $rootScope.taskContext.getSelectedTasks(),
                files = [],
                combineFiles = [];
            for (let task of tasks)
                if (task.status == 'complete') files.push(task.files[0].path.replace(/\//g, '\\'));
            if (files.length > 0) {
                for (let file of files) {
                    if (file.includes('[METADATA]')) continue;
                    if (!file.match(/\.(mp4|mkv|avi|flv|jpg|png)$/)) continue;
                    let nameWithoutEXT = file.replace(/(-\d{1,3})?\.(mp4|mkv|avi|flv|jpg|png)$/, ''),
                        part = file.match(/-(\d{1,3})+\.(mp4|mkv|avi|flv|jpg|png)$/),
                        extension = file.substr(files[0].length - 3),
                        index = combineFiles.findIndex(item => item.name == nameWithoutEXT);
                    if (part) part = parseInt(part[1]) - 1;
                    else part = 0;
                    if (index > -1) combineFiles[index].part[part] = file;
                    else {
                        let combineFile = { name: nameWithoutEXT, ext: extension, part: [] };
                        combineFile.part[part] = file;
                        combineFiles.push(combineFile);
                    }
                }
                let result = {
                    images: [],
                    videos: []
                };
                combineFiles.forEach(obj => {
                    let ext = '.mkv', type = 'videos';
                    if (obj.ext.match(/(jpg|png)/)) {
                        ext = '.jpg';
                        type = 'images';
                    }
                    result[type].push({
                        filename: obj.name.replace(/.*\\/g, '') + ext,
                        parts: Array.from(obj.part)
                    });
                });
                if (('VideoCombine://' + encodeURIComponent(JSON.stringify(result.videos))).length > 2048) {
                    ariaNgNotificationService.notifyInPage('', '合并url链接过长，请分开合并', { type: 'error' });
                    return;
                }
                if (typeof browser === 'undefined') {
                    if (result.images.length > 0) console.log(1);
                    if (result.videos.length > 0) location.href = 'VideoCombine://' + encodeURIComponent(JSON.stringify(result.videos));
                }
                else {
                    browser.tabs.create({ url: 'VideoCombine://' + encodeURIComponent(JSON.stringify(result.videos)), active: false }).then(tab => browser.tabs.onUpdated.addListener((id, cInfo) => {
                        if (cInfo.status && cInfo.status == 'complete') {
                            browser.tabs.remove(id);
                        }
                    }, { tabId: tab.id }));
                }
                ariaNgNotificationService.notifyInPage('', `已将${files.length}个文件（合并为${combineFiles.length}个）推送到合并程序`, { type: 'success' });
                $scope.removeTasks();
            }
        };
    }]);
})();