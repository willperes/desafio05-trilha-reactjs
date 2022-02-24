import { format } from 'date-fns';
import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import { RichText } from 'prismic-dom';
import Header from '../../components/Header';

import Prismic from '@prismicio/client';
import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { useRouter } from 'next/router';
import ptBR from 'date-fns/locale/pt-BR';

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
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  const router = useRouter();

  return router.isFallback ? (
    <h1>Carregando...</h1>
  ) : (
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
            <span>{format(new Date(post.first_publication_date), "d MMM yyyy", { locale: ptBR } )}</span>
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

        {post.data.content.map(content => (
          <div className={styles.content} key={content.heading}>
            <h2>{content.heading}</h2>
            <div className={styles.contentBody} dangerouslySetInnerHTML={{ __html: RichText.asHtml(content.body) }} />
          </div>
        ))}
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
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      banner: {
        url: response.data.banner.url
      },
      author: response.data.author,
      content: response.data.content.map(content => {
        return {
          heading: content.heading,
          body: content.body
        }
      })
    }
  }

  return {
    props: {
      post
    }
  }
};