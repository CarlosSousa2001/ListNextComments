import { GetServerSideProps } from 'next';
import styles from './styles.module.css'
import Head from 'next/head';

import Link from 'next/link'; 

import {FiShare2} from 'react-icons/fi'
import {FaTrash} from 'react-icons/fa'

import {getSession} from 'next-auth/react'
import Textarea from '@/components/textarea';
import { ChangeEvent, FormEvent, useEffect, useState } from 'react';


import {db} from '../../services/firebaseConnection'
import {addDoc, collection, query, orderBy, where, onSnapshot, doc, deleteDoc} from 'firebase/firestore'

interface HomeProps {
    user:{
        email: string
    }
}
interface TaskProps {
    id:string;
    createdAt: Date;
    public: boolean;
    tarefa: string;
    user: string;
}

const Dashboard = ({user}: HomeProps) => {

    const [input, setInput] = useState('');
    const [publicTask, setPublicTask] = useState(false);
    const [tasks, setTasks] = useState<TaskProps[]>([]);


    useEffect(()=>{
        async function loadTarefas() {
            const tarefasRef = collection(db, "tarefas")
            const q = query(
                tarefasRef, orderBy("createdAt", "desc"),
                where("user", "==", user?.email)
            )

            onSnapshot(q, (snapshot)=>{
                let lista = [] as TaskProps[];

                snapshot.forEach((doc)=>{
                    lista.push({
                        id: doc.id,
                        tarefa: doc.data().tarefa,
                        createdAt: doc.data().createdAt,
                        user: doc.data().user,
                        public: doc.data().public,
                    })
                })
                setTasks(lista)
            })
        }

        loadTarefas()
    }, [user?.email])

    const handleChangePublic = (e: ChangeEvent<HTMLInputElement>) => {
        setPublicTask(e.target.checked);
    }

    const handleRegisterTask = async (e: FormEvent) => {
        e.preventDefault();

        if(input === '') return;

        try{
            await addDoc(collection(db, "tarefas"),{
                tarefa: input,
                createdAt: new Date(),
                user: user?.email,
                public: publicTask,
            });

            setInput("");
            setPublicTask(false);
        }catch(error){
            console.log(error)
        }
    }

    const handleShare = async (id: string) => {
        await navigator.clipboard.writeText(
            `${process.env.NEXT_PUBLIC_URL}/task/${id}`
        )
        alert("Url copiada com sucesso!")
    } 

    const handleDeleteTask = async (id: string) => {
        const docRef = doc(db, "tarefas", id)
        await deleteDoc(docRef)
    }


    return ( 
        <div className={styles.container}>
            <Head>
                <title>Painel de tarefas</title>
            </Head>

            <main className={styles.main}>
                <section className={styles.content}>
                    <div className={styles.contentForm}>
                        <h1 className={styles.title}>
                            <form onSubmit={handleRegisterTask}>
                                <Textarea placeholder='Escreva sua tarefa'
                                value={input}
                                onChange={(e:ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value)}
                                />
                                <div className={styles.checkboxArea}>
                                    <input type="checkbox" name="check"className={styles.checkbox}
                                    checked={publicTask}
                                    onChange={handleChangePublic}
                                    />
                                    <label>Deixar tarefa pública ?</label>
                                </div>

                                <button type="submit" className={styles.button}>
                                    Regitrar
                                </button>
                            </form>
                        </h1>
                    </div>
                </section>

                <section className={styles.taskContainer}>
                    <h1>Minhas tarefas</h1>

                {tasks.map((item, index)=>{
                    return (
                        <article key={index} className={styles.task}>
                            {item.public && (
                                <div className={styles.tagContainer}>
                                    <label className={styles.tag}>Público</label>
                                    <button className={styles.shareButton} onClick={()=> handleShare(item.id)}>
                                        <FiShare2 size={22} color="#3183ff"/>
                                    </button>
                                </div>
                            )}

                        <div className={styles.taskContent}>
                        {item.public ? (
                                <Link href={`/task/${item.id}`}>
                                    <p>{item.tarefa}</p>
                                </Link>
                            ) : (
                                <p>{item.tarefa}</p>
                        )}
                            <button className={styles.trash} onClick={() => handleDeleteTask(item.id)}>
                                <FaTrash size={24} color='#ea3140'/>
                            </button>
                        </div>
                    </article>
                    )
                })}
                    
                </section>
            </main>
        </div>
    );
}

export const getServerSideProps: GetServerSideProps = async ({req}) => {

    const session = await getSession({req})
    
    if(!session){
        return {
            redirect:{
                destination:'/',
                permanent:false
            }
        }
    }

    return{
        props:{
            user:{
                email: session?.user?.email,
            }
        }
    }
}


export default Dashboard;