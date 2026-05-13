import { useEffect, useState } from "react";
import {
  ensureLessonCatalogLoaded,
  getLessonCatalogSnapshot,
  subscribeLessonCatalog,
} from "../data/lessonCatalog";

export function useLessonCatalog() {
  const [snapshot, setSnapshot] = useState(getLessonCatalogSnapshot());

  useEffect(() => {
    const unsubscribe = subscribeLessonCatalog(() => {
      setSnapshot(getLessonCatalogSnapshot());
    });

    void ensureLessonCatalogLoaded();

    return unsubscribe;
  }, []);

  return snapshot;
}

void useLessonCatalog;

