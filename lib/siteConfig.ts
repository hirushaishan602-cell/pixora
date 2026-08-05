import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";
import { defaultSiteConfig, SiteConfig } from "./types";

const CONFIG_DOC = doc(db, "pixora_siteConfig", "main");

export async function getSiteConfig(): Promise<SiteConfig> {
  const snap = await getDoc(CONFIG_DOC);
  if (!snap.exists()) {
    return defaultSiteConfig;
  }
  return { ...defaultSiteConfig, ...(snap.data() as Partial<SiteConfig>) };
}

export async function updateSiteConfig(config: SiteConfig): Promise<void> {
  await setDoc(CONFIG_DOC, config, { merge: true });
}
