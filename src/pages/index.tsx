import { GetStaticProps } from "next";
import Head from "next/head";
import Image from "next/image";
import styles from "../styles/home.module.scss";
import Prismic from "@prismicio/client";

import techsImage from "../../public/images/techs.svg";
import { getPrismicClient } from "../services/prismic";

type Content = {
  title: string;
  titleContent: string;
  linkAction: string;
  mobileTitle: string;
  mobileContent: string;
  mobileBanner: string;
  webTitle: string;
  webContent: string;
  webBanner: string;
};

interface ContentProps {
  content: Content;
}

export default function Home({ content }: ContentProps) {
  console.log(content);
  return (
    <>
      <Head>
        <title>Apaixonado por técnologia - Sujeito Programador</title>
      </Head>
      <main className={styles.container}>
        <div className={styles.containerHeader}>
          <section className={styles.ctaText}>
            <h1>{content.title}</h1>
            <span>{content.titleContent}</span>
            <a href={content.linkAction}>
              <button>COMEÇAR AGORA!</button>
            </a>
          </section>
          <img
            src="/images/banner-conteudos.png"
            alt="Conteúdos Sujeito Programador"
          />
        </div>

        <hr className={styles.divisor} />

        <div className={styles.sectionContent}>
          <section>
            <h2>{content.mobileTitle}</h2>
            <span>{content.mobileContent}</span>
          </section>
          <img
            src={content.mobileBanner}
            alt="Conteúdos Desenvolvimento de Apps"
          />
        </div>

        <hr className={styles.divisor} />

        <div className={styles.sectionContent}>
          <img
            src={content.webBanner}
            alt="Conteúdos Desenvolvimento de Aplicações Web"
          />
          <section>
            <h2>{content.webTitle}</h2>
            <span>{content.webContent}</span>
          </section>
        </div>

        <div className={styles.nextLevelContent}>
          <Image quality={100} src={techsImage} alt="Técnologias" />
          <h2>
            Mais de <span className={styles.alunos}>15 mil</span> já levaram sua
            carreira ao próximo nivel.
          </h2>
          <span>
            E você vai perder a chance de evoluir de uma vez por todas?
          </span>
          <a href={content.linkAction}>
            <button>ACESSAR TURMA !</button>
          </a>
        </div>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const PrismicDOM = require("prismic-dom");

  const response = await prismic.query([
    Prismic.Predicates.at("document.type", "home"),
  ]);

  //console.log(response.results[0].data)

  const {
    title,
    sub_title,
    link_action,
    mobile,
    mobile_content,
    mobile_banner,
    title_web,
    web_content,
    web_banner,
  } = response.results[0].data;

  const content = {
    title: PrismicDOM.RichText.asText(title),
    titleContent: PrismicDOM.RichText.asText(sub_title),
    linkAction: link_action.url,

    mobileTitle: PrismicDOM.RichText.asText(mobile),
    mobileContent: PrismicDOM.RichText.asText(mobile_content),
    mobileBanner: mobile_banner.url,

    webTitle: PrismicDOM.RichText.asText(title_web),
    webContent: PrismicDOM.RichText.asText(web_content),
    webBanner: web_banner.url,
  };

  return {
    props: {
      content,
    },
    revalidate: 60 * 2, // A cada 2 minutos
  };
};
