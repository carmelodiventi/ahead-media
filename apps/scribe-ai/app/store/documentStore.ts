import { create } from 'zustand';
import { DocumentState } from '../types/Document.types';

const documentStore = create<DocumentState>((set, get) => ({
  isResearching: false,
  onIsResearching: (isResearching: boolean) => {
    set({
      isResearching,
    });
  },
}));

export default documentStore;
