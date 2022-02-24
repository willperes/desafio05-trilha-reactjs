import Header from '../components/Header';
import { useState } from 'react';
import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { getPrismicClient } from '../services/prismic';
import Prismic from '@prismicio/client';

import { motion } from 'framer-motion/dist/framer-motion'
import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {
  const [nextLink, setNextLink] = useState(postsPagination.next_page);
  const [posts, setPosts] = useState<Post[]>(postsPagination.results);

  const loadMorePosts = async (nextPage: string): Promise<void> => {
    const result = await fetch(nextPage);
    const data = await result.json();
    const newPostPagination = {
      nextPage: data.next_page,
      results: data.results.map(post => {
        return {
          uid: post.uid,
          first_publication_date: post.first_publication_date,
          data: post.data,
        };
      }),
    };
    setNextLink(newPostPagination.nextPage);

    setPosts(prevState => [...prevState, ...newPostPagination.results]);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: .75 }}>
      <Head>
        <title>Posts | Space Travelling</title>
      </Head>

      <Header />

      <main className={styles.container}>
        <div className={styles.posts}>
          {!posts ? (
            <p>Carregando...</p>
          ) : (
            posts.map((post: Post) => (
              <Link key={post.uid} href={`/post/${post.uid}`}>
                <a>
                  <strong>{post.data.title}</strong>
                  <p>{post.data.subtitle}</p>
                  <footer>
                    <div className={styles.postInformation}>
                      <div className={styles.publicationDate}>
                        <img src="/images/calendar.svg" alt="Calendar icon" />
                        <time>{format(new Date(post.first_publication_date), `d MMM y`, {
                          locale: ptBR,
                        })}</time>
                      </div>
                      <div className={styles.author}>
                        <img src="/images/user.svg" alt="User icon" />
                        <span>{post.data.author}</span>
                      </div>
                    </div>
                  </footer>
                </a>
              </Link>
            ))
          )}
        </div>
      </main>

      {nextLink && (
        <div className={styles.loadMorePosts}>
          <button
            type="button"
            onClick={() => loadMorePosts(nextLink)}
          >
            Carregar mais posts
          </button>
        </div>
      )}
    </motion.div>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();

  const postsResponse = await prismic.query([
    Prismic.predicates.at('document.type', 'posts')
  ], {
    fetch: ['posts.title', 'posts.subtitle', 'posts.author'],
    pageSize: 2,
  })

  const postsPagination = {
    next_page: postsResponse.next_page,
    results: postsResponse.results.map(post => {
      return {
        uid: post.uid,
        first_publication_date: post.first_publication_date,
        data: post.data,
      };
    }),
  };

  return {
    props: {
      postsPagination
    }
  };
};
