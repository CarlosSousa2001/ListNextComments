import { GetStaticProps } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css'
import heroImg from '../../public/assets/hero.png'
import {collection, getDocs} from 'firebase/firestore'

import { db } from '@/services/firebaseConnection'

const inter = Inter({ subsets: ['latin'] })

interface HomeProps{
  posts:number;
  comments:number;
}

export default function Home({posts,comments}:HomeProps) {
  return (
    <div className={styles.container}>
      <Head>
        <title>Organize tarefas</title>
      </Head>

      <main className={styles.main}>
        <div className={styles.logoContent}>
          <Image
            className={styles.hero}
            src={heroImg}
            alt="logo"
            priority
          />
        </div>
        <h1 className={styles.title}>Sistema feito para você organizar <br /> seus estudo e tarefas</h1>

        <div className={styles.infoContent}>
          <section className={styles.box}>
            <span>{posts} posts</span>
          </section>
          <section className={styles.box}>
            <span>{comments} comentários</span>
          </section>
        </div>

      </main>
    </div>
  )
}


export const getStaticProps:GetStaticProps = async () => {

  const commentRef = collection(db, "comments");
  const postRef = collection(db, "tarefas");

  const commentsSnapshot = await getDocs(commentRef);
  const postSnapshot = await getDocs(postRef);


    return {
      props:{
        posts:postSnapshot.size || 0,
        comments: commentsSnapshot.size || 0
      },
      revalidate: 60 // revalidada a cada 60 segundos
    }
}