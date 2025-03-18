import { FC, useEffect, useState } from 'react';
import styles from './index.module.scss';
import { Button } from 'antd';
import { useTranslation } from 'react-i18next';
import i18n, { LangEnum } from '@/locale';
import { hasKeyStore, getStore, setStore } from '@/utils/localStorage';

const STORE_LANG = '__store_language__';
const YELLOW = '#faad14';
const NORMAL = '#595959';

const SwitchLang: FC = () => {
  const { t } = useTranslation();
  const [lang, setLang] = useState(LangEnum.EN);

  const initLang = () => {
    if (hasKeyStore(STORE_LANG)) {
      setLang(getStore(STORE_LANG));
      return;
    }
    setLang(LangEnum.EN);
    setStore(STORE_LANG, LangEnum.EN);
  };

  const handleChange = (lan: LangEnum) => {
    setLang(lan);
    setStore(STORE_LANG, lan);
  };

  useEffect(() => {
    i18n.changeLanguage(lang);
  }, [lang]);

  useEffect(() => {
    initLang();
  }, []);

  return (
    <div className={styles.switchLang}>
      <div className={styles.switchBtn}>
        <Button
          onClick={() => handleChange(LangEnum.EN)}
          className={styles.btn}
          style={{ color: lang === LangEnum.EN ? YELLOW : NORMAL }}
          color="cyan"
          type="link"
        >
          {t('lan.en')}
        </Button>
        /
        <Button
          onClick={() => handleChange(LangEnum.ZH)}
          className={styles.btn}
          style={{ color: lang === LangEnum.ZH ? YELLOW : NORMAL }}
          color="cyan"
          type="link"
        >
          {t('lan.zh')}
        </Button>
      </div>
    </div>
  );
};
export default SwitchLang;
