import { Inter } from 'next/font/google'
import type { InferGetStaticPropsType, GetStaticProps } from 'next'


interface DataJson {
  date: String
}

export const getStaticProps = (async (context) => {
  const currentDate =  new Date().toUTCString();
  var dataJson = { date: currentDate}
  console.log(dataJson);

  return { props: { dataJson }, 
  revalidate: 10 }
}) satisfies GetStaticProps<{
  dataJson: DataJson
}>

export default function Home({
  dataJson,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  return <h1 className="text-3xl font-bold underline">{dataJson.date}</h1>
}
