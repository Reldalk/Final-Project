function createElemWithText(tag = "p", textContent = "", className){
    const myElem = document.createElement(tag);
    myElem.textContent = textContent;
    if(className !== undefined)
        myElem.className = className;
    return myElem;
}

function createSelectOptions(json){
    const optionArray = [];
    if(json){
        json.forEach(item => {
            const myElem = document.createElement("option");
            myElem.value = item.id;
            myElem.textContent = item.name;
            optionArray.push(myElem);
        });
        return optionArray;
    }
    return undefined;
}

function toggleCommentSection(postId){
    if(postId == undefined)
        return undefined;
    const elem = document.querySelector(`section[data-post-id='${postId}']`)
    if(elem){
        const classes = elem.classList;
        classes.toggle('hide');
        return elem;
    }
    return null;
}

function toggleCommentButton(postId){
    if(postId == undefined)
        return undefined;
    const elem = document.querySelector(`button[data-post-id='${postId}']`);
    if(elem){
        elem.textContent = elem.textContent == 'Show Comments' ? 'Hide Comments' : 'Show Comments';
        return elem;
    }
    return null;
}

function deleteChildElements(parentElement){
    if(parentElement == undefined || parentElement instanceof HTMLElement != true)
        return undefined;
    
    let child = parentElement.lastElementChild;
    while(child){
        parentElement.removeChild(child);
        child = parentElement.lastElementChild;
    }
    return parentElement;
}

function addButtonListeners(){
    const buttons = document.getElementsByTagName("main")[0].getElementsByTagName("button");
    const buttonArray = [];
    if(buttons){
        buttons.forEach(button => {
            let postId = button.getAttribute('data-post-id');
            button.addEventListener("click", function (e) {toggleComments(e, postId)}, false);
            buttonArray.push(button);
        })
    }
    return buttonArray;
}

function removeButtonListeners(){
    const buttons = document.getElementsByTagName("main")[0].getElementsByTagName("button");
    const buttonArray = [];
    if(buttons){
        buttons.forEach(button => {
            let postId = button.getAttribute('data-post-id');
            button.removeEventListener('click', function (e) {toggleComments(e, postId)}, false);
            buttonArray.push(button);
        })
    }
    return buttonArray;
}

function createComments(comments) {
    if(!comments) {return undefined}
    const fragment = document.createDocumentFragment();
    comments.forEach(comment => {
        const article = document.createElement('article');
        const h3 = createElemWithText('h3', comment.name);
        const p1 = createElemWithText('p', comment.body);
        const p2 = createElemWithText('p', `From: ${comment.email}`);
        article.appendChild(h3);
        article.appendChild(p1);
        article.appendChild(p2);
        fragment.appendChild(article);
    });
    return fragment;
  }

  function populateSelectMenu(users) {
    if(!users){return undefined};
    const selectMenu = document.getElementById('selectMenu');
    const options = createSelectOptions(users);
    options.forEach(option => {
        selectMenu.appendChild(option);
    });
    return selectMenu;
  }

async function getUsers() {
    let data;
    try{
        const response = await fetch('https://jsonplaceholder.typicode.com/users');
        data = await response.json();
    }
    catch (err){
        console.error(err);
    }
    return data;
}

async function getUserPosts(userId){
    if(!userId) { return undefined };
    try{
        const res = await fetch(`https://jsonplaceholder.typicode.com/posts?userId=${userId}`);
        if(!res.ok) throw new Error("Status code not in 200-299 range");
        return await res.json();
    }
    catch (err){
        console.error(err);
    }
}

async function getUser(userId){
    if(!userId) { return undefined };
    try{
        const res = await fetch(`https://jsonplaceholder.typicode.com/users?id=${userId}`);
        if(!res.ok) throw new Error("Status code not in 200-299 range");
        data = await res.json();
        return data[0];
    }
    catch (err){
        console.error(err);
    }
}

async function getPostComments(postId){
    if(!postId) { return undefined };
    try{
        const res = await fetch(`https://jsonplaceholder.typicode.com/comments?postId=${postId}`);
        if(!res.ok) throw new Error("Status code not in 200-299 range");
        return await res.json();
    }
    catch (err){
        console.error(err);
    }
}

async function displayComments(postId) {
    if(!postId) { return undefined };
    const section = document.createElement('section');
    section.dataset.postId = postId;
    section.classList.add('comments');
    section.classList.add('hide');
    const comments = await getPostComments(postId);
    const fragment = createComments(comments);
    section.appendChild(fragment);
    return section;
  }

  async function createPosts(posts) {
    if(!posts) { return undefined };
    const fragment = document.createDocumentFragment();
  
    for (const post of posts) {

      const article = document.createElement('article');

      const h2 = document.createElement('h2');
      h2.textContent = post.title;

      const p1 = document.createElement('p');
      p1.textContent = post.body;

      const p2 = document.createElement('p');
      p2.textContent = `Post ID: ${post.id}`;

      const author = await getUser(post.userId);

      const p3 = document.createElement('p');
      p3.textContent = `Author: ${author.name} with ${author.company.name}`;

      const p4 = document.createElement('p');
      p4.textContent = author.company.catchPhrase;

      const button = document.createElement('button');
      button.textContent = 'Show Comments';
      button.dataset.postId = post.id;

      article.appendChild(h2);
      article.appendChild(p1);
      article.appendChild(p2);
      article.appendChild(p3);
      article.appendChild(p4);
      article.appendChild(button);
  
      const section = await displayComments(post.id);

      article.appendChild(section);
      fragment.appendChild(article);
    }
  
    // return the fragment
    return fragment;
  }

  async function displayPosts(posts){
    const main = document.getElementsByTagName("main")[0];

    let variable;
    if(posts){
        variable = await createPosts(posts);
    }
    else{
        variable = document.createElement('p');
        variable.classList.add('default-text');
        variable.textContent = "Select an Employee to display their posts.";
    }

    main.append(variable);
    return variable;
  }
  

function toggleComments(event, postId){
    if(!event || !postId) { return undefined };
    event.target.listener = true;
    const section = toggleCommentSection(postId);
    const button = toggleCommentButton(postId);
    return [section, button]
}

async function refreshPosts(postData){
    if(!postData) { return undefined } 
    const removeButtons = removeButtonListeners();
    const main = deleteChildElements(document.getElementsByTagName("main")[0]);
    const fragment = await displayPosts(postData);
    const addButtons = addButtonListeners();
    return [removeButtons, main, fragment, addButtons];
}

async function selectMenuChangeEventHandler(event){
    if(!event) { return undefined }
    const selectMenu = document.getElementById("selectMenu");
    selectMenu.disabled = true;
    const userId = event?.target?.value || 1;
    const userPosts = await getUserPosts(userId);
    const refreshedPosts = await refreshPosts(userPosts);
    selectMenu.disabled = false;
    return [userId, userPosts, refreshedPosts];
}

async function initPage(){
    const users = await getUsers();
    const select = populateSelectMenu(users);
    return [users, select];
}

function initApp(){
    initPage();
    const selectMenu = document.getElementById("selectMenu");
    selectMenu.addEventListener("change", function (e) {selectMenuChangeEventHandler(e)}, false);
}

document.addEventListener("DOMContentLoaded", initApp(), false);