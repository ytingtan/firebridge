import React from 'react';

function Article(props) {
    return (
        <div>
            <article>
                <a href={"https://reddit.com" + props.article.permalink} target="_blank">
                    <h3>{ props.article.title}</h3>
                </a>
            </article>
        </div>
    );
    
}

export default Article;