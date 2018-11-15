function appendCopyButton(tootArticleElement) {
    const isIdToot = tootArticleElement.innerHTML.includes('<span>切り株</span>');
    if(!isIdToot) { return; }

    if(tootArticleElement.querySelector('.id-copy-button')) {
        return;
    }

    const id = /([A-Z0-9]+)/.exec(tootArticleElement.querySelector('.status__content p').innerText)[0];
    if(!id) { return;}

    const copyButton = document.createElement('button');
    copyButton.innerText = 'Copy ID';
    copyButton.classList.add('id-copy-button');
    copyButton.style.border = 'none';
    copyButton.style.borderRadius = '3px';
    copyButton.style.backgroundColor = 'rgb(52, 152, 219)';
    copyButton.style.color = 'white';
    copyButton.style.padding = '0.5em 1em';
    copyButton.style.textAlign = 'center';

    copyButton.addEventListener('click', () => {
        navigator.clipboard.writeText(id).then(() => alert('Copied: ' + id));
    });
    
    tootArticleElement.querySelector('.status__content').appendChild(copyButton);
}

const tootObserver = new MutationObserver((recordList) => {
    for(const record of recordList) {
        appendCopyButton(record.target);
    }
});

const columnObserver = new MutationObserver((recordList) => {
    for(const record of recordList) {
        record.target.querySelectorAll('.item-list article').forEach((tootElement) => {
            appendCopyButton(tootElement);
            tootObserver.observe(tootElement, { attributes: true });
        });
    }
});

columnObserver.observe(document.querySelector('.columns-area'), { childList: true, subtree: true });

document.querySelectorAll('.item-list article').forEach(appendCopyButton);