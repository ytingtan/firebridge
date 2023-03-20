import { useAuthContext } from "../context/auth"
import { useRouter } from 'next/router'
import useSWR from 'swr'
import fetcher from '../lib/utils'
import { useEffect, useState } from 'react'
import _ from 'lodash'
import Article from "./Article";

function Feed() {

  const router = useRouter()

  const { token, user, isLoading } = useAuthContext()
  const [tokenVal ] = token
  const [userVal, setUser] = user
  const [loading, setLoading] = isLoading
  

  const { data: fetchUser } = useSWR(['/api/user', tokenVal], fetcher)

  useEffect(() => {
    if (!loading && !userVal && typeof window !== 'undefined') {
      router.push('/login')
    }
  }, [loading, userVal, router])

  useEffect(() => {
    if (fetchUser && !_.isEqual(fetchUser, userVal)) {
      setUser(fetchUser)
      setLoading(false)
    }
    }, [fetchUser, setUser, setLoading, userVal])

  const [articles, setArticles] = useState([]);
  const [subreddit, setSubreddit] = useState('r/bridge');

  useEffect(() => {
    fetch("https://www.reddit.com/r/bridge.json").then(res => {
      if(res.status != 200) {
        console.log("ERROR");
        return;
      }

      res.json().then(data => {
        if (data != null) {
          setArticles(data.data.children);
        }
      })
    })
  }, [subreddit]);
    // was going to do Welcome back, name! but is giving error so i close eye first 
    return (
        <div> 
        <h1> Welcome back!</h1> 
        <h3> View featured polls, followed polls and your own polls. </h3>
        <header className="Feed-header">
          <input type="text" className="input" defaultValue="r/bridge"></input>
        </header>
        <div className="articles">
          {(articles != null) ? articles.map((article, index) => <Article key={index} article={article.data} />) : ''}
        </div>
        </div>
    );
}

export default Feed; 