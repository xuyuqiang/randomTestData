import './App.css';
import { useEffect, useRef } from 'react';
import { bitable, UIBuilder } from "@lark-base-open/js-sdk";
import callback from './runUIBuilder';
import { useTranslation } from 'react-i18next';
import './i18n'; // 取消注释以启用国际化

export default function App() {
  const currentTable = useRef<string|null>();
  const translation = useTranslation();
  useEffect(() => {
    const uiBuilder = new UIBuilder(document.querySelector('#container') as HTMLElement, {
      bitable,
      callback,
      translation,
    });

    const selectChange = bitable.base.onSelectionChange((selection) => {
      const tId = selection.data.tableId;
      if (currentTable.current !== tId) {
        currentTable.current = tId;
        uiBuilder.reload();
      }
    })

    return () => {
      selectChange();
      uiBuilder.unmount();
    };
  }, [translation]);
  
  return (
    <div id='container'></div>
  );
}