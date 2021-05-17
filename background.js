chrome.browserAction.onClicked.addListener(() => chrome.tabs.create({
    url: chrome.extension.getURL('index.html')
}));
chrome.contextMenus.create({ title: '发送至Aria2下载', contexts: ['link'], onclick: sendToAria2 });

function sendToAria2(info) {
    let options = localStorage.getItem('AriaNg.Options');
    if (!options) return console.error('未初始化Aria2');
    let { rpcHost, rpcInterface, rpcPort } = JSON.parse(options);
    fetch(`http://${rpcHost}:${rpcPort}/${rpcInterface}?tm=${new Date().getTime()}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        },
        body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'aria2.addUri',
            id: (new Date()).getTime().toString(),
            params: [[info.linkUrl,]]
        })
    }).then(res =>
        res.status >= 200 && res.status < 300
    ).then(result =>
        result ? console.log('成功推送 1 个下载链接至Aria2') : console.error('推送下载链接失败')
    ).catch(e =>
        console.error('出现未知错误：', e)
    );
}