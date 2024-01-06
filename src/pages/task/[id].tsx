import Head from "next/head";
import styles from "./styles.module.css"
import { GetServerSideProps } from "next";
import { ChangeEvent, FormEvent, useState } from "react";
import {useSession} from 'next-auth/react'

import {FaTrash} from 'react-icons/fa'

import { db } from "@/services/firebaseConnection"; 
import {doc, collection, where, query, getDoc, addDoc, getDocs, deleteDoc } from "firebase/firestore";
import Textarea from "@/components/textarea";


interface TaskProps{
    item:{
        tarefa:string;
        public: Boolean;
        createdAt:String;
        user:String;
        taskId:String;
    };
    allComments: CommentsProps[]
}


interface CommentsProps{
    id:String;
    comments:String;
    user:String;
    taskId:String;
    name:String;
}

const Task = ({item, allComments}:TaskProps) => {

    const {data:session} = useSession();

    const [input, setInput] = useState("");
    const [comments, setComments] = useState<CommentsProps[]>(allComments || []);

    const handleComment =async (e:FormEvent) => {
        e.preventDefault()
        
        if(input === '') return;

        if(!session?.user?.email || !session?.user?.name) return;

        try {
            const docRef = await addDoc(collection(db, "comments"),{
                comments: input,
                createdAt: new Date(),
                user: session?.user.email,
                name: session?.user.name,
                taskId: item?.taskId
            })

            const data ={
                id:docRef.id,
                comments:input,
                user: session?.user?.email,
                name: session?.user?.name,
                taskId: item.taskId
            }
            setComments((oldItem)=>[...oldItem, data])

        } catch (error) {
            console.log(error)
        }
    }

    const handleDeleteCommente = async (id: string) => {
        try {
            const docRef = doc(db, "comments", id)
            await deleteDoc(docRef)

            const deleteComments = comments.filter((item)=>{
                return item.id !== id;
            })
            
            alert("Deletado")

            setComments(deleteComments)
            
        } catch (error) {
            console.log(error)
        }
    }

    return ( 
        <div className={styles.container}>
            <Head>
                <title>Tarefa - Detalhes</title>
            </Head>

            <main className={styles.main}>
                <h1>Tarefa</h1>

                <article className={styles.task}>
                    <p>{item.tarefa}</p>
                </article>
            </main>

            <section className={styles.commentsContainer}>
                <h2>Deixar comentário</h2>

                <form onSubmit={handleComment}>
                    <Textarea 
                    value={input}
                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value)}
                    placeholder="Digite seu comentário"/>
                    <button type="submit" className={styles.button} disabled={!session?.user}>
                        Enviar comentário
                    </button>
                </form>
            </section>

            <section className={styles.commentsContainer}>
                <h2>Todos comentários</h2>

                {comments.length == 0 &&(
                    <span>Nenhum comentário foi encontrando</span>
                )}

                {comments.map((item, index)=>{
                    return (
                        <article key={index} className={styles.comment}>
                            <div className={styles.headComment}>
                                <label className={styles.commentsLabel}>{item.name}</label>
                                {item.user === session?.user?.email && (
                                    <button className={styles.buttonTrash} onClick={()=> handleDeleteCommente(item.id.toString())}>
                                        <FaTrash size={18} color="#EA3140"/>
                                    </button>
                                )
                                }
                            </div>
                            <p>{item.comments}</p>
                        </article>
                    )
                })}
            </section>
        </div>
    );
}

export const getServerSideProps: GetServerSideProps = async ({params}) =>{

    const id = params?.id as string

    // todos comentarios
    const q = query(collection(db, "comments"), where("taskId", "==", id))
    const snapshotComments = await getDocs(q)

    let allComments: CommentsProps[] = []

    snapshotComments.forEach((item) =>{
        allComments.push({
            id: item.id,
            comments: item.data().comments,
            user: item.data().user,
            name: item.data().name,
            taskId: item.data().taskId
        })
    })

    // console.log(allComments);

    // todos comentarios final
    const docRef = doc(db, "tarefas", id)
    const snapshot = await getDoc(docRef)

    if(snapshot.data() === undefined){
        return{
            redirect:{
                destination: "/",
                permanent: false
            }
        }
    }

    if(!snapshot.data()?.public){
        return{
            redirect:{
                destination: "/",
                permanent: false
            }
        }
    }

    const milisecond = snapshot.data()?.createdAt.seconds * 1000

    const task = {
        tarefa: snapshot.data()?.tarefa,
        public: snapshot.data()?.public,
        createdAt: new Date(milisecond).toLocaleDateString(),
        user:snapshot.data()?.user,
        taskId: id
    }

    // console.log(task)

    return {
        props:{
            item:task,
            allComments: allComments
        }
    }
}

export default Task;