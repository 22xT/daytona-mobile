// styled.d.ts — en la RAIZ del proyecto, al lado de package.json.
// Le dice a TypeScript que forma tiene el tema, para que
// p.theme.colors.navy autocomplete y no de error.
import 'styled-components/native';
import { Theme } from './src/lib/theme';

declare module 'styled-components/native' {
  export interface DefaultTheme extends Theme {}
}
