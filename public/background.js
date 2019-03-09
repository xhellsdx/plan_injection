
chrome.browserAction.onClicked.addListener(() => {
  console.log('background');
});


// chrome.runtime.onMessage.addListener((t, s, i) => {
//   chrome.storage.local.get('options', (result) => {
//     const options = result.options;
//     if (options.styles) {
//       chrome.tabs.insertCSS(s.tab.id, {
//         code: options.styles,
//         runAt: 'document_start',
//       });
//     }
//   });
// });
