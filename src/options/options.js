// вытаскивает настройки из storage расширения и выставляет их на странице options.html
function loadOptions() {
  chrome.storage.local.get('options', (result) => {
    const options = result.options;
    if (!options) return false;
    for (const key in options) {
      if (!{}.hasOwnProperty.call(options, key)) continue;
      const keyElement = document.querySelector(`[data-option="${key}"]`);
      if (!keyElement || !keyElement.type) continue;
      switch (keyElement.type) {
        case 'text':
        case 'color': keyElement.value = options[key]; break;
        case 'checkbox': keyElement.checked = options[key]; break;
        default: keyElement.value = options[key];
      }
    }
    return true;
  });
}
loadOptions();

function saveOptions() {
  const options = { styles: 'a.tasks-kanban-item-title{margin-right: 5px !important;}' };
  const optionsElements = [...document.querySelectorAll('[data-option]')];
  optionsElements.forEach((element) => {
    // добавляем выбранные опции в объект
    switch (element.type) {
      case 'color':
      case 'text': if (element.value !== '') options[element.dataset.option] = element.value; break;
      case 'checkbox': if (element.checked === true) options[element.dataset.option] = element.checked; break;
      default: break;
    }

    // дополнительные проверки для нестандартных опций
    switch (element.dataset.option) {
      case 'userId':
        if (!isNaN(Number(element.value)) && element.value > 0) options.userId = Number(element.value); break;

      case 'nameColor':
        if ('isChangeUserNameColor' in options && options.isChangeUserNameColor === true && 'userId' in options) options.styles += ` div.feed-com-text a[href="/company/personal/user/${options.userId}/"]{color: ${element.value} !important;font-weight: bold !important;}`; break;

      case 'newCommentColor':
        if ('isChangeNewCommentColor' in options && options.isChangeNewCommentColor === true) options.styles += ` .feed-com-block-new{ background-color: ${element.value}!important;}`; break;

      case 'tagallNewColor':
        if ('isTagallNewColor' in options && options.isTagallNewColor === true) options.styles += ` .tagall_color{ color: ${element.value}!important;}`; break;

      case 'isAddMessagesBorders':
        if (element.checked === true) options.styles += ' div.feed-com-main-content{border-width: 1px !important;border-style: solid !important;border-color: rgba(143,148,151,.49) !important;}'; break;

      case 'isHideLiveFeed':
        if (element.checked === true) options.styles += ' div#bx-desktop-tab-im-lf, table.pagetitle-toolbar-field-view div#sidebar{display: none !important;}'; break;

      case 'isReturnUsersStatus':
        if (element.checked === true) options.styles += ' span.bx-messenger-cl-status{display: inline-block !important;}'; break;

      case 'isHideTasksImg':
        if (element.checked === true) options.styles += ' div.main-kanban-item a.tasks-kanban-item-image {display: none !important;}'; break;

      case 'isTasksLikesHide':
        if (element.checked === true) options.styles += ' span.feed-inform-ilike.feed-new-like, div.feed-post-emoji-top-panel-outer {display: none !important;}'; break;

      case 'quotesBackgroundColor':
        if ('isQuotesNewColor' in options && options.isQuotesNewColor === true) options.styles += ` table.forum-quote{background-color: ${element.value} !important;`; break;

      case 'quotesBorderColor':
        if ('isQuotesNewColor' in options && options.isQuotesNewColor === true) options.styles += ` border-color: ${element.value} !important;color: black !important;} table.forum-quote a{color: #2067b0 !important;}`; break;
      default: break;
    }
  });

  // сохраняем объект с настройками в storage расширения
  chrome.storage.local.set({ options });
  // chrome.storage.local.remove(['options']);
  // console.log(options);

  // уведомление о сохранении настроек
  const saveStatusBlock = document.querySelector('.status');
  saveStatusBlock.innerText = 'Настройки сохранены';
  setTimeout(() => {
    saveStatusBlock.innerText = '';
  }, 2000);
}

document.querySelector('.save').addEventListener('click', saveOptions);
