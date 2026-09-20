import { useEffect } from "react";
import { useAppDispatch } from "@/app/hooks";
import { setPageHeader, clearPageHeader } from "@/app/uiSlice";

export interface PageHeaderOptions {
  title?: string | null;
  description?: string | null;
}

/**
 * Custom hook allowing any feature page or subcomponent to declaratively
 * set its header title and description in the main layout.
 */
export function usePageHeader({ title, description }: PageHeaderOptions) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(setPageHeader({ title, description }));
    return () => {
      dispatch(clearPageHeader());
    };
  }, [dispatch, title, description]);
}

export default usePageHeader;
