const {readFile} = require('fs').promises;
const path = require('path');
const { builder } = require("@netlify/functions")

const request =  require('./httpPromise.js');

function getAuthors (post){
    return post._embedded.author.reduce((acc,auth)=>acc+`<span class="author">${auth.name}</span>`, '');
}

function getArticles(articles){
    return articles.reduce((acc, post)=>{
        return acc + `<article>
        <h2 class="title"><a href="${post.link}">${post.title.rendered}</a></h2>
        <p class="authors"> Written by: ${getAuthors(post)} </p>
        <div class="excerpt">${post.excerpt.rendered}</div>
        <p class="continue"><a href="${post.link}">Continue reading "${post.title.rendered}" at CSS-Tricks</a></p>
    </article>`
    },'');
}

async function createHTMLDoc(response){

    const index = await readFile(path.join(__dirname,'index.html'));
    let indexBody = index.toString('utf-8');
    const articles = JSON.parse(response.body);

    indexBody = indexBody.replace('{{generatedDateTime}}',(new Date()).toISOString());

    return indexBody.replace('{{addArticles}}', getArticles(articles));
}

async function cssTrickz(event, context) {

    const requestOpts = new URL("https://css-tricks.com/wp-json/wp/v2/posts?per_page=12&_embed=1&_fields=title,link,excerpt,_links.author");
    try {
        const cssTricks = await request(requestOpts);
        return {statusCode:200, headers:{"content-type":'text/html'}, body: await createHTMLDoc(cssTricks)};
    } catch(e) {
        console.log(e);
        return { statusCode: 500, body: JSON.stringify(e)};
    }
}

exports.handler = builder(cssTrickz);