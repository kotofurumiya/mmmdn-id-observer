// トゥート要素にコピーボタンを追加する
function appendCopyButton(tootArticleElement) {
    // 切り株トゥート以外ならなにもしない
    const isIdToot = tootArticleElement.innerHTML.includes('<span>切り株</span>');
    if(!isIdToot) { return; }

    // 既に追加されたらなにもしない
    if(tootArticleElement.querySelector('.id-copy-button')) {
        return;
    }

    // トゥートからIDっぽいものをを切り出す
    // 誤爆の可能性あるけど気にしない
    const id = /([A-Z0-9]+)/.exec(tootArticleElement.querySelector('.status__content p').innerText)[0];
    if(!id) { return;}

    // コピーボタンを作る
    const copyButton = document.createElement('button');
    copyButton.innerText = 'Copy ID';
    copyButton.classList.add('id-copy-button');
    copyButton.style.border = 'none';
    copyButton.style.borderRadius = '3px';
    copyButton.style.backgroundColor = 'rgb(52, 152, 219)';
    copyButton.style.color = 'white';
    copyButton.style.padding = '0.5em 1em';
    copyButton.style.textAlign = 'center';

    // クリック時にIDをクリップボードにコピーする
    copyButton.addEventListener('click', () => {
        navigator.clipboard.writeText(id).then(() => alert('Copied: ' + id));
    });
    
    // トゥート要素の中にボタンを追加する
    tootArticleElement.querySelector('.status__content').appendChild(copyButton);
}

// トゥート要素 -> MutationObserverのweakマップ
const elementToObserver = new WeakMap();

// カラムコンテナに対するオブザーバ
// 中のカラムが変更されたら発火する
const columnObserver = new MutationObserver((recordList) => {
    // 各変更に対して
    for(const record of recordList) {
        // 削除されたノードの中から
        // トゥート要素を抽出して、紐づいたオブザーバを停止する
        // Text要素も入ってくるからNodeだけフィルターで通したいんだけど、いい方法ない？今はquerySelectorAllの有無で分けてる。
        Array.from(record.removedNodes).filter((rn) => 'querySelectorAll' in rn).forEach((rn) => {
            const removedTootList = Array.from(rn.querySelectorAll('.item-list article'));
            removedTootList.filter((t) => elementToObserver.has(t)).forEach((t) => {
                elementToObserver.get(t).disconnect();
                elementToObserver.delete(t);
            });
        });

        // 変更のあったカラムの中からトゥート要素を抽出して、
        // オブザーバを登録する
        const tootList = Array.from(record.target.querySelectorAll('.item-list article'));
        tootList.filter((elem) => !elementToObserver.has(elem)).forEach((tootElement) => {
            appendCopyButton(tootElement);

            const tootObserver = new MutationObserver((recordList) => {
                recordList.forEach((record) => appendCopyButton(record.target));
            });

            tootObserver.observe(tootElement, { attributes: true });
            elementToObserver.set(tootElement, tootObserver);
        });
    }
});

// カラムコンテナに対するオブザーバに要素を登録する。
columnObserver.observe(document.querySelector('.columns-area'), { childList: true, subtree: true });

// 初期化
document.querySelectorAll('.item-list article').forEach(appendCopyButton);