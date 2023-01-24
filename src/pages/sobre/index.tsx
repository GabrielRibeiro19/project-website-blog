import { GetStaticProps } from "next";
import Head from "next/head";

import styles from './styles.module.scss'

import { FaInstagram, FaFacebook, FaWhatsapp, FaLinkedin } from 'react-icons/fa'

import { getPrismicClient } from "../../services/prismic";
import Prismic from '@prismicio/client'

type Content = {
    title: string;
    description: string;
    banner: string;
    facebook: string;
    instagram: string;
    whatsapp: string;
    //linkedin: string;
}

interface ContentProps{
    content: Content
}

export default function Sobre({content}: ContentProps){
    return(
        <>
            <Head>
                <title>
                   Quem somos? | Gabriel Ribeiro
                </title>
            </Head>
            <main className={styles.container}>
                <div className={styles.containerHeader}>
                    <section className={styles.ctaText}>
                        <h1>{content.title}</h1>
                        <p>{content.description}</p>

                        <a href={content.whatsapp}>
                            <FaWhatsapp size={40} />
                        </a>

                        <a href={content.instagram}>
                            <FaInstagram size={40} />
                        </a>

                        <a href={content.facebook}>
                            <FaFacebook size={40} />
                        </a>

                        {/* <a href={content.linkedin}>
                            <FaLinkedin size={40} />
                        </a> */}
                    </section>

                    <img 
                        src={content.banner} 
                        alt={content.title} 
                    />
                </div>
            </main>
        </>
    )
}

export const getStaticProps: GetStaticProps = async () => {

    const PrismicDOM = require("prismic-dom");

    const prismic = getPrismicClient();
    const response = await prismic.query([
        Prismic.Predicates.at('document.type', 'about')
    ])

    const {
        title,
        description,
        banner,
        facebook,
        instagram,
        whatsapp,
       // linkedin,
     } = response.results[0].data

     const content = {
         title: PrismicDOM.RichText.asText(title),
         description: PrismicDOM.RichText.asText(description),
         banner: banner.url,
         facebook: facebook.url,
         instagram: instagram.url,
         whatsapp: whatsapp.url,
         //linkedin: linkedin.url
     }

    return{
        props:{
            content
        },
        revalidate: 60 * 15 // A cada 15 minutos será revalidado. 
    }
}