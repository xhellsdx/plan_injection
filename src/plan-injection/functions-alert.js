/*
Функции для расширения функционала на странице /alert/
*/

// добавляет кнопку открытия всех задач
export function addAllTasksOpenButton() {
  const openAllTasks = document.createElement('span');
  openAllTasks.style = 'display: inline-block; vertical-align: middle; background-color: #e4ae16; padding: 0 10px; font-size: 12px; text-align: center; text-align-last: center; line-height: 24px; border: none; color: #ffffff; transition: all .3s; box-sizing: border-box; cursor: pointer; border-radius: 6px;';
  openAllTasks.innerText = 'Открыть все задачи';
  document.querySelector('a.delete-button').parentNode.insertBefore(openAllTasks, document.querySelector('a.delete-button').nextElementSibling);

  openAllTasks.addEventListener('click', () => {
    const tasksMessages = [...document.querySelectorAll('div.message-message')];
    const tasksId = [];
    tasksMessages.forEach((message) => {
      const link = message.querySelector('a').href;
      if (!link.includes('/tasks/task/view/')) return false;
      const re = /\/tasks\/task\/view\/(\d+?)\/.*/i;
      const messageTaskId = re.exec(link)[1];
      if (tasksId.includes(messageTaskId)) return false;
      tasksId.push(messageTaskId);
      window.open(link);
      return true;
    });
  });
}

// для задач указывает названия групп, к которым они относятся
export function addGroupName() {
  const blocks = [...document.querySelectorAll('div.task-messages-wrapper')];
  blocks.forEach((block) => {
    const gropuA = block.querySelector('div.task-messages div.message-item div.message-message a');
    const groupURL = gropuA.href.replace(/task\/view\/.+/gi, '');
    const re = /в группе (.+)\)/gi;
    const groupName = re.exec(gropuA.outerHTML);
    if (!Array.isArray(groupName)) return false;
    const taskTitle = block.querySelector('div.task-title');
    const aElement = document.createElement('a');
    aElement.setAttribute('href', groupURL);
    aElement.innerText = groupName[1];
    taskTitle.innerHTML += ' | Группа ';
    taskTitle.appendChild(aElement);
    return true;
  });
}

// отмечает сообщения и задачи, которые адресованы юзеру
export function markMessagesToUsers(firstName, secondName) {
  const messages = [...document.querySelectorAll('div.message-message')];
  messages.forEach((message) => {
    if (message.innerText.includes(`${firstName} ${secondName}`)
      || message.innerText.includes(`${secondName} ${firstName}`)
      || message.innerText.toLowerCase().includes('tagall')) {
      message.previousElementSibling.style = 'background-image: url(https://e.unicode-table.com/orig/81/912866cba59b54bb8f5271f6ac5a68.png); background-repeat: no-repeat; background-size: 20px; background-position: -2px 37%;';
    }
  });

  const blocks = [...document.querySelectorAll('div.task-messages-wrapper')];
  blocks.forEach((block) => {
    if (
      block.querySelector('div.task-messages').innerText.includes(`${firstName} ${secondName}`)
      || block.querySelector('div.task-messages').innerText.includes(`${secondName} ${firstName}`)
      || block.querySelector('div.task-messages').innerText.toLowerCase().includes('tagall')
    ) {
      block.style = 'background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%228%22%20height%3D%2211%22%20viewBox%3D%220%200%208%2011%22%3E%0A%20%20%3Cpath%20fill%3D%22%23F16C0A%22%20fill-rule%3D%22evenodd%22%20d%3D%22M200.069979%2C24%20L200.14%2C24%20C200.14%2C24%20203%2C23.0560625%20203%2C20.390625%20C203%2C16.6348125%20199.346667%2C15.8813125%20199.666667%2C13%20C197.993333%2C13.8339375%20195%2C16.75375%20195%2C19.875%20C195.039359%2C21.7259245%20196.174362%2C23.3629491%20197.86%2C24%20L197.86%2C24%20L198.123417%2C24%20C197.460595%2C23.3218266%20197.059336%2C22.4251727%20197%2C21.4707569%20C197.092476%2C20.0452868%20197.868205%2C18.7524059%20199.082454%2C18%20C200.109798%2C20.1851885%20201.164908%2C19.9436239%20201.164908%2C21.4707569%20C201.162991%2C22.4339232%20200.76293%2C23.3471724%20200.069979%2C24%20Z%22%20transform%3D%22translate%28-195%20-13%29%22/%3E%0A%3C/svg%3E%0A"); background-repeat: no-repeat; background-size: 13px; background-position: 5px 17px;';
    }
  });
}

// удаляет все сообщения задачи на странице /alert/
export function alertDeleteMessage() {
  window.addEventListener('storage', () => {
    if (!localStorage.deletedMessages) return;
    const deletedMessages = localStorage.deletedMessages.split(',');
    deletedMessages.forEach((message) => {
      const messageToDelete = document.querySelector(`div.message-message[data-id="${message}"]`);
      if (!messageToDelete) return false;
      if (messageToDelete.parentNode.parentNode.parentNode.classList.contains('task-messages-wrapper')) {
        messageToDelete.parentNode.parentNode.parentNode.outerHTML = '';
      } else {
        messageToDelete.parentNode.parentNode.removeChild(messageToDelete.parentNode);
      }
      return true;
    });
    localStorage.removeItem(deletedMessages);
  });
}

// селект для фильтрации сообщений по группам
export function addGroupFilter() {
  const blocks = [...document.querySelectorAll('div.task-messages-wrapper')];
  const messages = [...document.querySelectorAll('div.message-item')];
  if (blocks.length === 0 && messages.length === 0) return false;

  const groups = {};
  const select = document.createElement('select');
  select.style = 'height: 30px; font-size: 12px; border: 1px solid #dbdbdb; margin-left: 25px; width: 200px;';

  if (blocks.length > 0 && messages.length > 0) {
    blocks.forEach((block) => {
      block.classList.add('injection_group');
      const gropuA = block.querySelector('div.task-messages div.message-item div.message-message a');
      if (!gropuA) {
        block.classList.add('injection_script_filter_none');
        groups.none = ('none' in groups) ? groups.none + 1 : 1;
        return false;
      }
      const re = /в группе (.+)\)/gi;
      let groupName = re.exec(gropuA.outerHTML);
      if (!Array.isArray(groupName)) {
        block.classList.add('injection_script_filter_none');
        groups.none = ('none' in groups) ? groups.none + 1 : 1;
        return false;
      }

      groupName = groupName[1];
      if (groupName in groups) {
        groups[groupName].count++;
      } else {
        groups[groupName] = { count: 1, id: Object.keys(groups).length };
      }
      block.classList.add(`injection_script_filter_${groups[groupName].id}`);
      return true;
    });
  }

  if (blocks.length === 0 && messages.length > 0) {
    messages.forEach((message) => {
      message.classList.add('injection_group');
      const gropuA = message.querySelector('div.message-message a');
      if (!gropuA) {
        message.classList.add('injection_script_filter_none');
        groups.none = ('none' in groups) ? groups.none + 1 : 1;
        return false;
      }
      const re = /в группе (.+)\)/gi;
      let groupName = re.exec(gropuA.outerHTML);
      if (!Array.isArray(groupName)) {
        message.classList.add('injection_script_filter_none');
        groups.none = ('none' in groups) ? groups.none + 1 : 1;
        return false;
      }

      groupName = groupName[1];
      if (groupName in groups) {
        groups[groupName].count++;
      } else {
        groups[groupName] = { count: 1, id: Object.keys(groups).length };
      }
      message.classList.add(`injection_script_filter_${groups[groupName].id}`);
      return true;
    });
  }

  const optionAll = document.createElement('option');
  optionAll.value = 'all';
  optionAll.innerText = 'Все группы';
  select.appendChild(optionAll);
  if (document.querySelector('div.injection_script_filter_none')) {
    const optionNone = document.createElement('option');
    optionNone.value = 'none';
    optionNone.innerText = `Без группы (${groups.none})`;
    select.appendChild(optionNone);
  }
  const groupsSort = Object.keys(groups).sort();

  groupsSort.forEach((group) => {
    if (group === 'none') return false;
    const option = document.createElement('option');
    option.innerText = `${group} (${groups[group].count})`;
    option.value = groups[group].id;
    select.appendChild(option);
  });

  const styles = document.createElement('style');
  styles.id = 'groupFilterInjection';
  document.head.appendChild(styles);
  select.addEventListener('change', () => {
    styles.innerHTML = (select.value === 'all') ? '' : `.injection_group{display: none !important;} div.injection_script_filter_${select.value}{display: block !important;}`;
  });

  const settingsBlock = document.querySelectorAll('div.settings-row');
  if (settingsBlock.length > 0) settingsBlock[settingsBlock.length - 1].appendChild(select);
  return true;
}
