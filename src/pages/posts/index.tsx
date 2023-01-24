import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import styles from "./styles.module.scss";

import { useState } from "react";

import { getPrismicClient } from "../../services/prismic";
import Prismic from "@prismicio/client";

import {
  FiChevronLeft,
  FiChevronsLeft,
  FiChevronRight,
  FiChevronsRight,
} from "react-icons/fi";
import { GetStaticProps } from "next";

type Post = {
  slug: string;
  title: string;
  cover: string;
  description: string;
  updatedAt: string;
};

interface PostsProps {
  posts: Post[];
  page: string;
  totalPage: string;
}

interface PostsTypeProps {
  type: string;
}

export default function Posts({
  posts: postsBlog,
  page,
  totalPage,
}: PostsProps) {
  const [posts, setPosts] = useState(postsBlog || []);
  const [currentPage, setCurrentPage] = useState(Number(page));

  // Buscar novos posts

  async function reqPost(pageNumber: number) {
    const prismic = getPrismicClient();
    const response = await prismic.query(
      [Prismic.Predicates.at("document.type", "post")],
      {
        orderings: "[document.last_publication_date desc]", // Ordenar pelo mais recente
        fetch: ["post.title", "post.description", "post.cover"],
        pageSize: 3,
        page: String(pageNumber),
      }
    );

    return response;
  }

  async function navigatePage(pageNumber: number) {
    const PrismicDOM = require("prismic-dom");

    const response = await reqPost(pageNumber);

    if (response.results.length === 0) {
      return;
    }

    const getPosts = await response.results.map((post: any) => {
      return {
        slug: post.uid,
        title: PrismicDOM.RichText.asText(post.data.title),
        description:
          post.data.description.find((content: PostsTypeProps) => content.type === "paragraph")
            ?.text ?? "",
        cover: post.data.cover.url,
        updatedAt: new Date(post.last_publication_date).toLocaleDateString(
          "pt-BR",
          {
            day: "2-digit",
            month: "long",
            year: "numeric",
          }
        ),
      };
    });

    setCurrentPage(pageNumber);
    setPosts(getPosts);
  }
  return (
    <>
      <Head>
        <title>Sujeito Programador</title>
      </Head>
      <main className={styles.container}>
        <div className={styles.posts}>
          {posts.map((post) => (
            <Link key={post.slug} href={`/posts/${post.slug}`}>
              <Image
                src={post.cover}
                alt={post.title}
                width={720}
                height={410}
                quality={100}
                placeholder="blur"
                blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP0WgAAAToA7MFtKiwAAAAASUVORK5CYII="
              />
              <strong>{post.title}</strong>
              <time>{post.updatedAt}</time>
              <p>{post.description}</p>
            </Link>
          ))}

          <div className={styles.buttonNavigate}>
            {Number(currentPage) >= 2 && (
              <div>
                <button onClick={() => navigatePage(1)}>
                  <FiChevronsLeft size={25} color="#FFF" />
                </button>
                <button onClick={() => navigatePage(Number(currentPage - 1))}>
                  <FiChevronLeft size={25} color="#FFF" />
                </button>
              </div>
            )}

            {Number(currentPage) < Number(totalPage) && (
              <div>
                <button onClick={() => navigatePage(Number(currentPage + 1))}>
                  <FiChevronsRight size={25} color="#FFF" />
                </button>
                <button onClick={() => navigatePage(Number(totalPage))}>
                  <FiChevronRight size={25} color="#FFF" />
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const PrismicDOM = require("prismic-dom");

  const response = await prismic.query(
    [Prismic.Predicates.at("document.type", "post")],
    {
      orderings: "[document.last_publication_date desc]", // Ordenar pelo mais recente
      fetch: ["post.title", "post.description", "post.cover"],
      pageSize: 3,
    }
  );

  const posts = response.results.map((post) => {
    return {
      slug: post.uid,
      title: PrismicDOM.RichText.asText(post.data.title),
      description:
        post.data.description.find(
          (content: PostsTypeProps) => content.type === "paragraph"
        )?.text ?? "",
      cover: post.data.cover.url,
      updatedAt: new Date(
        String(post.last_publication_date)
      ).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }),
    };
  });

  return {
    props: {
      posts,
      page: response.page,
      totalPage: response.total_pages,
    },
    revalidate: 60 * 30, // atualiza a cada 30 minutos
  };
};
