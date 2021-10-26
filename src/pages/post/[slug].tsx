/* eslint-disable no-use-before-define */
/* eslint-disable react/no-array-index-key */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { GetStaticPaths } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { RichText } from 'prismic-dom';
import React from 'react';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import Header from '../../components/Header';
import { getPrismicClient } from '../../services/prismic';
import styles from './post.module.scss';

interface IPost {
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
  post: IPost;
}
const Post: React.FC<PostProps> = ({ post }) => {
  const router = useRouter();
  if (router.isFallback) {
    return <div>Loading...</div>;
  }
  return (
    <>
      <Head>
        <title>{post.data.title} | space.traveling</title>
      </Head>
      <Header />
      <main>
        <article className={styles.article}>
          <img
            src={post.data.banner?.url}
            alt={post.data.title}
            className={styles.banner}
          />
          <section className={styles.postContainer}>
            <h1>{post.data.title}</h1>
            <div className={styles.postDetails}>
              <div className={styles.postIconGroup}>
                <FiCalendar size={20} />
                <span>{post.first_publication_date}</span>
              </div>
              <div className={styles.postIconGroup}>
                <FiUser size={20} />
                <span>{post.data.author}</span>
              </div>
              <div className={styles.postIconGroup}>
                <FiClock size={20} />
                <span>{post.first_publication_date}</span>
              </div>
            </div>

            <section className={styles.postContent}>
              {post.data.content.map((item, idx) => (
                <React.Fragment key={idx}>
                  <h2>{item.heading}</h2>
                  <p>{item.body}</p>
                </React.Fragment>
              ))}
            </section>
          </section>
        </article>
      </main>
    </>
  );
};

export default Post;

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: true,
  };
};

export const getStaticProps = async ({ params }) => {
  const { slug } = params;
  const prismic = getPrismicClient();

  const response = await prismic.getByUID('post', String(slug), {});

  const newContent = response.data.content.map(item => {
    return {
      heading: item.heading[0].text,
      body: item.body[0].text,
    };
  });

  const post = {
    uid: response.uid,
    data: {
      title: RichText.asText(response.data.title),
      author: RichText.asText(response.data.author),
      banner: {
        url: response.data.banner.url,
      },

      content: newContent,
    },

    first_publication_date: format(
      new Date(response.first_publication_date),
      'ii eeee yyyy',
      {
        locale: ptBR,
      }
    ),
  };
  return {
    props: {
      post,
    },
  };
};
