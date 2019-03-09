/*
Функции, которые отрабатывают на всех страницах CRM
*/

// в результатах поиска верхней панели скрывает кривые ссылки на страницы форума
export function hideForumInSearchResult() {
  const searchResults = [...document.querySelectorAll('div.search-title-top-list-wrap div.search-title-top-item.search-title-top-item-js')];
  searchResults.forEach((res) => {
    const searchHref = res.querySelector('a.search-title-top-item-link').href;
    if (searchHref.includes('/community/forum/') || searchHref.includes('#message')) res.style.display = 'none';
  });
}

// закрывает сообщения, которые не адресованы юзеру
export function hideNotForUserMessages(firstName, secondName) {
  const popUpMessages = [...document.querySelectorAll('div.bx-notifyManager-item')];
  popUpMessages.forEach((message) => {
    if (
      message.innerText.includes(' комментарий к задаче [#')
      && (!message.innerText.includes(`${firstName} ${secondName}`)
      && !message.innerText.includes(`${secondName} ${firstName}`) && !message.innerText.toLowerCase().includes('tagall'))
    ) message.querySelectorAll('a.bx-notifier-item-delete')[0].click();
  });
}

// отключает открытие задачи при клике на тег задачи в канбане
export function disableShowTaskOnTagClick() {
  const kanbanTaskItems = [...document.querySelectorAll('span.tasks-kanban-item-tags span')];
  kanbanTaskItems.forEach((item) => {
    if (item.hasAttribute('onclick')) return false;
    item.setAttribute('onclick', 'event.stopPropagation();');
    return true;
  });
}

// выбирает единственного найденного сотрудника при поиске через +
export function autoChoiseFindSingleUser() {
  const finderUsers = document.querySelector('div#BXSocNetLogDestinationSearch.popup-window.bx-finder-popup.bx-finder-v2');
  if (finderUsers) {
    const users = finderUsers.querySelectorAll('a.bx-finder-box-item-t7.bx-finder-element.bx-lm-element-user');
    if (users.length === 1) users[0].click();
  }
}

// на страницах проектов добавляет в title название проекта
// TODO: в канбане криво работает
export function changeTitleOnProjectPage() {
  if (location.href.search(/^https:\/\/plan.pixelplus.ru\/workgroups\/group\/\d.+?\/tasks\/($|\?)/gi) !== -1) {
    let messagesCnt = '';
    if (document.title[0] === '(') {
      const re = /^(\(.+?\))/gi;
      messagesCnt = `${re.exec(document.title)[1]} `;
    }
    document.title = `${messagesCnt + document.querySelector('div.profile-menu-info a').innerText.replace(' — SEO', '')} — Задачи проекта`;
  }
  if (document.title[0] !== '(') {
    const alertNum = document.querySelector('div.bx-im-informer-num');
    if (alertNum && alertNum.innerText.length > 0) document.title = `(${alertNum.innerText}) ${document.title}`;
  }
}

// функция для добавления кнопки восстановления длинных ссылок
export function addLongLinkRepair() {
  if (!location.href.includes('/task/view/') || document.querySelector('span.long-link-repair')) return false;
  const repairLink = document.createElement('span');
  repairLink.className = 'long-link-repair';
  repairLink.style = 'color: #a8aeb5; font-size: 13px; display: block;';
  repairLink.innerText = 'Починить ссылки';
  const likeBlock = document.querySelector('div.task-detail-like');
  if (likeBlock) likeBlock.appendChild(repairLink);

  repairLink.addEventListener('click', (e) => {
    const links = [...document.querySelectorAll('div.task-detail-description a, div.feed-com-text-inner-inner a')];
    links.forEach((link) => {
      if (link.innerText.includes('...')) link.innerText = link.href;
      e.target.innerText = 'OK';
    });
  });

  repairLink.addEventListener('mouseover', (e) => {
    e.target.style.cursor = 'pointer';
    e.target.style.color = '#828b95';
  });
  repairLink.addEventListener('mouseout', (e) => {
    e.target.style.cursor = 'default';
    e.target.style.color = '#a8aeb5';
  });
  return true;
}

// добавляет кнопку для удаления всех уведомлений текущей задачи
// FIXME: deletedMessages криво записывается
export function addDelAllTaskMessages() {
  if (!location.href.includes('/task/view/') || document.querySelector('span.delete-messages-alert')) return false;
  const delMessagesLink = document.createElement('span');
  delMessagesLink.className = 'delete-messages-alert';
  delMessagesLink.style = 'color: #a8aeb5; font-size: 13px; display: block; cursor: pointer;';
  delMessagesLink.innerText = 'Удалить уведомления задачи';
  const likeBlock = document.querySelector('div.task-detail-like');
  if (likeBlock) likeBlock.appendChild(delMessagesLink);

  async function getUrl(url, options) {
    const response = await fetch(url, options);
    const data = await response.text();
    return data;
  }

  delMessagesLink.addEventListener('click', () => {
    getUrl('https://plan.pixelplus.ru/alert/', { method: 'GET', credentials: 'same-origin' })
      .then((code) => {
        const deletedMessages = [];
        const re = /\/tasks\/task\/view\/(\d+?)\/.*/i;
        const currentTaskId = re.exec(location.href)[1];
        const parser = new DOMParser();
        const alertCode = parser.parseFromString(code, 'text/html');
        const messages = [...alertCode.querySelectorAll('div.message-item div.message-message')];
        messages.forEach((message) => {
          const taskInMessage = message.querySelector('a[href*="/task/view/"]');
          if (!taskInMessage) return false;
          const taskIDInMessage = re.exec(taskInMessage.href)[1];
          if (taskIDInMessage !== currentTaskId) return false;
          const NOTIFY_ID = message.getAttribute('data-id');
          getUrl('https://plan.pixelplus.ru/bitrix/components/bitrix/im.messenger/im.ajax.php?NOTIFY_REMOVE&V=72', {
            method: 'POST', credentials: 'same-origin', body: `IM_NOTIFY_REMOVE=Y&NOTIFY_ID=${NOTIFY_ID}&IM_AJAX_CALL=Y&sessid=${bitrixSessid}`, headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
          })
            .then(() => {
              deletedMessages.push(NOTIFY_ID);
              localStorage.deletedMessages = deletedMessages;
            });
          return true;
        });
        delMessagesLink.innerText = 'Уведомления удалены';
      });
  });

  delMessagesLink.addEventListener('mouseout', (e) => {
    e.target.style.color = '#a8aeb5';
  });
  return true;
}

// отмечает сообщения, которые никому не адресованы
export function markMessagesWithoutDestination() {
  if (!location.href.includes('/task/view/')) return false;
  const messages = [...document.querySelectorAll('div.feed-com-text')];

  messages.forEach((message) => {
    const messageUserBox = message.previousElementSibling;
    const messageUserId = messageUserBox.firstChild.getAttribute('bx-tooltip-user-id');
    let messageText = message.innerText;
    const re = /\/company\/personal\/user\/(\d+?)\/.*/i;
    messageText = messageText.substring(0, 101);
    if (messageText.toLowerCase().includes('tagall')) {
      if (messageUserBox.querySelector('span.warning_message')) messageUserBox.querySelector('span.warning_message').className = '';
      return false;
    }
    const usersInCommetns = [...message.querySelectorAll('a[href*="/company/personal/user/"]')];
    usersInCommetns.forEach((comment) => {
      const linkText = comment.innerText;
      const linkIdUserId = re.exec(comment.href)[1];
      if (messageUserId == linkIdUserId) return false;
      if (messageText.includes(linkText)) return false;
      return true;
    });

    const warningImg = document.createElement('span');
    warningImg.className = 'warning_message';
    warningImg.style = 'background-image: url(https://stjah.com/image/catalog/text/01publick.png); width: 20px; height: 20px; top: 5px; position: absolute; z-index: 9999; background-size: 20px 20px;';
    warningImg.title = 'В первой части комментария нет ни одного обращения к другому пользователю';
    messageUserBox.appendChild(warningImg);
    return true;
  });
  return true;
}

// добавляет кнопку разворачивания всех сообщений задачи
export function openAllCommentsInTask() {
  if (!location.href.includes('/task/view/')) return false;
  const pagination = document.querySelector('a.feed-com-all');
  if (pagination && !document.querySelector('a.open-all-comments')) {
    const openAllComments = document.createElement('a');
    let url = location.href.replace(/#.*/gi, '');
    openAllComments.className = 'feed-com-all open-all-comments';
    url += window.location.search === '' ? '?MID=1' : '&MID=1';
    openAllComments.setAttribute('href', url);
    openAllComments.innerText = ' | Открыть все комментарии';
    pagination.parentNode.insertBefore(openAllComments, pagination.nextElementSibling);
  }
  return true;
}

// в канбане добавляет кнопку редактирования задачи
export function addEditTaskButton() {
  const kanbanItemEdit = [...document.querySelectorAll('div.tasks-kanban-item')];
  kanbanItemEdit.forEach((item) => {
    if (item.querySelector('a.edit-task-link')) return false;
    const link = item.querySelector('a.tasks-kanban-item-title').href.replace('/view/', '/edit/');
    const editTaskA = document.createElement('a');
    editTaskA.setAttribute('href', link);
    editTaskA.className = 'edit-task-link';
    editTaskA.setAttribute('onclick', 'event.stopPropagation()');
    editTaskA.setAttribute('title', 'Редактировать задачу');
    editTaskA.style = 'background-image: url(https://quantummedia.it/wp-content/uploads/2018/01/if_Edit_1891026.png); width: 15px;height: 15px;right: 5px;top: 5px;position: absolute;z-index: 9999;background-size: 15px 15px;';
    item.insertBefore(editTaskA, item.firstChild);
    return true;
  });
}

// в канбане добавляет кнопку указания текущего месяца к задаче
export function addCurrentMountButton(bitrixSessid) {
  const kanbanItem = [...document.querySelectorAll('div.tasks-kanban-item')];
  kanbanItem.forEach((item) => {
    if (item.querySelector('span.add-mount-tag')) return false;
    const mountTag = document.createElement('span');
    mountTag.className = 'add-mount-tag';
    mountTag.setAttribute('onclick', 'event.stopPropagation();');
    mountTag.setAttribute('title', 'Добавить тег текущего месяца');
    mountTag.style = 'background-image: url(http://files.softicons.com/download/application-icons/toolbar-icons-by-gentleface/png/128/tag.png); width: 15px;height: 15px;right: 5px;top: 23px;position: absolute;z-index: 9999;background-size: 15px 15px;';
    mountTag.addEventListener('click', (e) => {
      const date = new Date()
        .toLocaleString('ru', {
          year: 'numeric',
          month: 'long',
        })
        .replace(/ (\d\d|г\.)/gi, ' ')
        .trim();
      const re = /.*\/view\/(\d+?)\/.*/gi;
      const taskId = re.exec(e.target.parentNode.querySelector('a.tasks-kanban-item-title').href);
      const xhr = new XMLHttpRequest();
      xhr.open('POST', 'https://plan.pixelplus.ru/bitrix/components/bitrix/tasks.base/ajax.php', true);
      xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
      xhr.setRequestHeader('Accept', 'application/json, text/javascript, */*; q=0.01');
      xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
      xhr.send(`sessid=${bitrixSessid}&EMITTER=&ACTION[0][OPERATION]=task.update&ACTION[0][ARGUMENTS][id]=${taskId[1]}&ACTION[0][ARGUMENTS][data][TAGS]=${date}`);
    });

    mountTag.addEventListener('mouseover', (e) => {
      e.target.style.cursor = 'pointer';
    });
    mountTag.addEventListener('mouseout', (e) => {
      e.target.style.cursor = 'default';
      e.target.style.color = '#a8aeb5';
    });
    item.insertBefore(mountTag, item.firstChild);
    return true;
  });
}

// помечает сообщения задачи, в которых обращаются к юзерам, которые в неё не добавлены
export function markMissingUsers() {
  if (location.href.includes('/task/view/')) {
    const usersInSidebar = [...document.querySelectorAll('div.task-detail-sidebar-content a.task-detail-sidebar-info-user-name.task-detail-sidebar-info-user-name-link')];
    const usersInCommetns = [...document.querySelectorAll('div.feed-com-text-inner-inner a[href^="/company/personal/user/"]')];
    if (usersInSidebar.length > 0 && usersInCommetns.length > 0) {
      const usersId = [];
      const re = /.*\/user\/(\d+?)\/.*/i;
      usersInSidebar.forEach((user) => {
        const id = re.exec(user.href);
        if (id) usersId.push(id[1]);
      });

      usersInCommetns.forEach((user) => {
        const userId = re.exec(user.href);
        if (!usersId.includes(userId[1])) {
          user.style = 'background-image: url(https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Emblem-important-red.svg/120px-Emblem-important-red.svg.png); background-repeat: no-repeat; background-size: 15px 15px; background-position-x: 99%; padding-right: 20px;';
          user.title = 'Пользователь не добавлен в задачу';
        } else {
          user.style = '';
          user.title = '';
        }
        return true;
      });
    }
  }
}

// задаёт класс для TAGALL в сообщениях
export function tagAllColorChange() {
  if (location.href.includes('/task/view/')) {
    const commentsBlocks = [...document.querySelectorAll('div.feed-com-text div.feed-com-text-inner')];
    commentsBlocks.forEach((comment) => {
      if (!comment.querySelector('b.tagall_color') && comment.innerText.includes('TAGALL')) {
        comment.innerHTML = comment.innerHTML.replace(/TAGALL/g, '<b class="tagall_color">TAGALL</b>');
      }
    });
  }
}

// считывает id сессии из тела страницы
export function getBitrixSessid() {
  const script = document.createElement('script');
  script.id = 'planInjectionScript';
  script.innerHTML = '(phpVars.bitrix_sessid === "" && typeof (bxSession) !== "undefined" && "sessid" in bxSession) ? planInjectionScript.dataset.bxsessid = bxSession.sessid : planInjectionScript.dataset.bxsessid = phpVars.bitrix_sessid;';
  document.head.appendChild(script);
  return script.dataset.bxsessid;
}
