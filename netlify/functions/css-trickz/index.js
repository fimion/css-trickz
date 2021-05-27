const https = require('https');

const request =  ((urlOptions, data="") => {
    return new Promise((resolve, reject) => {
      const req = https.request(urlOptions,
        (res) => {
          let body = '';
          res.on('data', (chunk) => (body += chunk.toString()));
          res.on('error', reject);
          res.on('end', () => {
            if (res.statusCode >= 200 && res.statusCode <= 299) {
  
              resolve({statusCode: res.statusCode, headers: res.headers, body: body});
            } else {
              reject('Request failed. status: ' + res.statusCode + ', body: ' + body);
            }
          });
        });
      req.on('error', reject);
      req.write(data, 'binary');
      req.end();
    });
  });

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

function createHTMLDoc(response){
    const articles = JSON.parse(response.body);
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>CSS-Trickz</title>
        <link rel="preconnect" href="https://fonts.gstatic.com">
        <link href="https://fonts.googleapis.com/css2?family=Irish+Grover&display=swap" rel="stylesheet">   
        <style>
    
            *{margin:0;padding:0;box-sizing: border-box;}
    
            html{
                background-color: black;
                color: white;
                font-family: sans-serif;
            }
    
            h1,h2,h3,h4,h5,h6{
                font-family: 'Irish Grover', cursive;
            }
    
            header {
                display:flex;
                justify-content: space-between;
                align-items: center;
                align-content: center;
                padding: 10px
            }
    
            header > h1 {
                text-transform: uppercase;
                font-size: 64px;
                color: hotpink;
            }
            header a,
            header a:link,
            header a:active,
            header a:hover,
            header a:focus{
                color: hotpink;
            }
    
            .articles{
                display: grid;
                grid-template-columns: 1fr 1fr 1fr;
    
            }
    
            article {
                background-color: white;
                border-radius: 20px;
                padding: 20px;
                margin: 10px;
                color: black;
            }
            .authors{
                font-size: .9em;
            }
            .excerpt{
                margin: 10px 0;
            }
            footer{
                display:flex;
                justify-content: center;
                align-items: center;
                padding: 20px;
            }
            footer > p {
                font-family: 'Irish Grover', cursive;
                font-size: xx-large;
            }
    
        </style>
    </head>
    <body>
        <header>
            <h1>CSS-Trickz!</h1>
            <p>You probably want <a href="https://css-tricks.com">CSS-Tricks</a></p>
        </header>
        <section id="articles" class="articles">
            ${getArticles(articles)}
        </section>
        <footer>
            <p>(Sorry Chris!)</p>
        </footer>
    </body>
    </html>`;
}

exports.handler = async function(event, context) {

    const requestOpts = new URL("https://css-tricks.com/wp-json/wp/v2/posts?per_page=12&_embed=1&_fields=title,link,excerpt,_links.author");
    
    try {
        const cssTricks = await request(requestOpts);
        return {statusCode:200, headers:{"content-type":'text/html'}, body:createHTMLDoc(cssTricks)};
    } catch(e) {
        console.log(e);
        return { statusCode: 500, body: JSON.stringify(e)};
    }
}