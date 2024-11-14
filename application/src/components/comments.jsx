'use client'
import Giscus from "@giscus/react";

export default function Comments() {
  return (
    <Giscus
      id="comments"
      repo="abaybektursun/abay.tech"
      repoId="R_kgDONN_Prg"
      category="General"
      categoryId="DIC_kwDONN_Prs4CkQpc"
      mapping="pathname"
      strict="0"
      reactionsEnabled="1"
      emitMetadata="0"
      inputPosition="bottom"
      theme="light"
      lang="en"
      loading="lazy"
    />
  );
}