let connectCount = 0;
let connectListStore = [];
let onGoingConnectionList = [];


document.getElementById('actionBtn').addEventListener('click', async () => {
    if (document.getElementById('actionBtn').textContent !== 'START CONNECTING') {
        onGoingConnectionList.forEach((id) => {
            clearTimeout(id);
        })
        reset();
        return '';
    }
    let [tab] = await chrome.tabs.query({
        active: true,
        windowType: "normal",
        currentWindow: true
    });
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: getPeopleList,
        args: ['test']
    }, (injectResult) => {
       
        if (injectResult[0]?.result == null) {
            document.getElementById('actionBtn').textContent = 'TRY AGAIN';
        }
        if (injectResult[0]?.result?.connectList?.length > 0) {
            connectListStore = injectResult[0].result.connectList;
            document.getElementById('actionBtn').textContent = 'STOP CONNECTING';
            document.getElementById('actionBtn').style.backgroundColor = '#F56D91';

            document.getElementById('increment_text').textContent = connectListStore.length;
            var setTime = setTimeout(() => {
                sendConnectionScript(connectListStore[connectCount]);
                popUpPageThemeChange();
                connectCount++;
            }, 3000);
            onGoingConnectionList.push(setTime);
        }
    });

});

function getPeopleList(test){
    let peopleList = document.querySelectorAll('ul.reusable-search__entity-result-list button');
    let paginationList = document.querySelectorAll('.artdeco-pagination__button');
    let peopleListId = {
        connectList:[],
        paginationList:[]
    }

    peopleList.forEach((people)=>{
        people.childNodes.forEach((item)=>{
            if(typeof (item.classList) == 'object'){
                if (item.classList.contains('artdeco-button__text')) {
                    if (item.innerHTML.trim() == 'Connect') {
                        peopleListId.connectList.push(people.id);
                    }
                }
            }
        })
    })

    paginationList.forEach((item)=>{
        peopleListId.paginationList.push(item.id);
    })

return peopleListId;
}

async function sendConnectionScript(btnId){
    let [tab] = await chrome.tabs.query({
        active:true,
        windowType:"normal",
        currentWindow : true
    });
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: sendConnect,
        args: [btnId]
    },(injectResult)=>{
        if(injectResult[0].result!==null){
            if(connectCount < connectListStore.length){
                var setTimeLoop = setTimeout(()=>{
                    sendConnectionScript(connectListStore[connectCount]);
                    popUpPageThemeChange();
                    connectCount++;
                },3000);
                onGoingConnectionList.push(setTimeLoop);
            }else{
                console.log('all connect send');
                reset()
            }
        }else{
            return '';
        }
    });
}


function sendConnect(btnId) {
    document.getElementById(btnId).click();
    document.getElementById('artdeco-modal-outlet').addEventListener('DOMNodeInserted', function (event) {
        document.querySelectorAll('#artdeco-modal-outlet .artdeco-button--2').forEach((item) => {
            if (item.innerHTML.trim().toLowerCase() == 'send') {
                document.getElementById(item.id).click();
            }
        });
    }, false);
    return btnId;
}

function popUpPageThemeChange() {
    let offSetValue = (233 - (Math.round((233 / connectListStore.length)) * (connectCount + 1)));
    document.getElementById('increment_text').textContent = (connectCount + 1);
    if (offSetValue <= 0) {
        document.getElementById('progressBar').style.strokeDashoffset = 0;
    } else {
        document.getElementById('progressBar').style.strokeDashoffset = offSetValue;
    }

}
function reset(params) {
    connectCount = 0;
    connectListStore = [];
    runningConnection = [];
    document.getElementById('progressBar').style.strokeDashoffset = 233;
    document.getElementById('increment_text').textContent = 0;
    document.getElementById('actionBtn').textContent = 'START CONNECTING';
    document.getElementById('actionBtn').style.backgroundColor = '#4E944F';
}