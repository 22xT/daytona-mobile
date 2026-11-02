import 'styled-components/native';
import { Theme } from './src/lib/theme';

declare module 'styled-components/native' {
  export interface DefaultTheme extends Theme {}
}
