import {
  alertDeleteMessage, addAllTasksOpenButton, addGroupName, markMessagesToUsers, addGroupFilter, calculateTasksCount,
} from './functions-alert';
import {
  hideForumInSearchResult, disableShowTaskOnTagClick, hideNotForUserMessages, autoChoiseFindSingleUser, changeTitleOnProjectPage, addLongLinkRepair, addDelAllTaskMessages, markMessagesWithoutDestination, openAllCommentsInTask, addEditTaskButton, addCurrentMountButton, markMissingUsers, tagAllColorChange, getBitrixSessid,
} from './functions';

let bitrixSessid = ''; // id сессии пользователя. Вытаскивается при DOMContentLoaded
let time = new Date().getTime();

chrome.storage.local.get('options', (result) => {
  const options = result.options;

  if (!options) return false;

  // Инъекция стилей
  if ('styles' in options) {
    const customStylesTag = document.createElement('style');
    customStylesTag.id = 'pixel-plan-injection-extension';
    customStylesTag.innerHTML = options.styles;
    document.documentElement.appendChild(customStylesTag);
  }

  // навешиваем обработчики
  document.addEventListener('DOMContentLoaded', () => {
    bitrixSessid = getBitrixSessid();
    scriptsInjection(options);
    if (location.href.includes('https://plan.pixelplus.ru/alert/')) alertScriptsInjection(options);

    const mutationObserver = new MutationObserver((mutationRecords) => {
      mutationRecords.forEach((mutationRecord) => {
        if (mutationRecord.type === 'childList') {
          if (mutationRecord.addedNodes.length > 0) {
            scriptsInjection(options);
          } else if (mutationRecord.removedNodes.length > 0) {
            scriptsInjection(options);
          }
        } else if (mutationRecord.type === 'attributes') {
          if (mutationRecord.attributeName === 'class' || mutationRecord.attributeName === 'style') {
            scriptsInjection(options);
          }
        }
      });
    });
    mutationObserver.observe(document, {
      childList: true, attributes: true, subtree: true, characterData: true, attributeFilter: ['class', 'style'],
    });

    window.addEventListener('focus', () => { scriptsInjection(options); });
    window.addEventListener('blur', () => { scriptsInjection(options); });
  });
  return true;
});


function scriptsInjection(options) {
  if (new Date().getTime() - time < 500) return;
  time = new Date().getTime();

  if ('isTagallNewColor' in options) tagAllColorChange();
  if ('isMarkMissingUsers' in options) markMissingUsers();
  if ('isHideForumInSearchResult' in options) hideForumInSearchResult();
  if ('isHideNotForUserMessages' in options && 'firstName' in options && 'secondName' in options) hideNotForUserMessages(options.firstName, options.secondName);
  if ('isDisableShowTaskOnTagClick' in options) disableShowTaskOnTagClick();
  if ('isAutoChoiseFindSingleUser' in options) autoChoiseFindSingleUser();
  if ('isChangeTitleOnProjectPage' in options) changeTitleOnProjectPage();
  if ('isAddLongLinkRepair' in options) addLongLinkRepair();
  if ('isAddDelAllTaskMessages' in options) addDelAllTaskMessages();
  if ('isMarkMessagesWithoutDestination' in options) markMessagesWithoutDestination();
  if ('isOpenAllCommentsInTask' in options) openAllCommentsInTask();
  if ('isAddEditTaskButton' in options) addEditTaskButton();
  if ('isAddCurrentMountButton' in options) addCurrentMountButton(bitrixSessid);
}

function alertScriptsInjection(options) {
  if ('isAddDelAllTaskMessages' in options) alertDeleteMessage();
  if ('isMarkMessagesToUsers' in options && 'firstName' in options && 'secondName' in options) markMessagesToUsers(options.firstName, options.secondName);
  if ('isAddGroupName' in options) addGroupName();
  if ('isAddAllTasksOpenButton' in options) addAllTasksOpenButton();
  if ('isAddGroupFilter' in options) addGroupFilter();
  calculateTasksCount();
}
