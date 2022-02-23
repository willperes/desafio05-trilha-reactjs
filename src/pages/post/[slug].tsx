import { format } from 'date-fns';
import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import { RichText } from 'prismic-dom';
import Header from '../../components/Header';

import Prismic from '@prismicio/client';
import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      };
    };
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  return (
    <>
      <Head>
        <title>{post.data.title}</title>
      </Head>

      <Header />

      <div className={styles.banner}>
        <img src={post.data.banner.url} alt={post.data.title} />
      </div>

      <main className={styles.container}>
        <h1>{post.data.title}</h1>
        <div className={styles.postInformation}>
          <div className={styles.publicationDate}>
            <img src="/images/calendar.svg" alt="Calendar icon" />
            <span>{post.first_publication_date}</span>
          </div>
          <div className={styles.author}>
            <img src="/images/user.svg" alt="User icon" />
            <span>{post.data.author}</span>
          </div>
          <div className={styles.readingTime}>
            <img src="/images/clock.svg" alt="Clock icon" />
            <span>4 min</span>
          </div>
        </div>

        <div className={styles.postContent} dangerouslySetInnerHTML={{ __html: post.data.content.body.text }} />
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(
    Prismic.Predicates.at('document.type', 'posts')
  );

  const paths = posts.results.map(post => {
    return {
      params: {
        slug: post.uid,
      },
    };
  });

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async context => {
  const { slug } = context.params;

  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {});

  const post = {
    first_publication_date: format(new Date(response.first_publication_date), "dd MMM yyyy"),
    data: {
      title: response.data.title,
      banner: {
        url: response.data.banner.url
      },
      author: response.data.author,
      content: {
        heading: response.data.content[0].heading,
        body: {
          text: RichText.asHtml(response.data.content[0].body)
        }
      }
    }
  }

  return {
    props: {
      post
    }
  }
};