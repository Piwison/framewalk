import { DiaryList } from "@/components/diary-list";

export default function DiaryPage() {
  return (
    <section aria-labelledby="diary-heading">
      <h1 id="diary-heading" className="mb-6 font-serif text-3xl text-ink">
        Diary
      </h1>
      <DiaryList />
    </section>
  );
}
