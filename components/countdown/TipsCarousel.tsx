import { TipsCarousel as SharedTipsCarousel } from '../shared/TipsCarousel';
import { tips } from './tips';

export function TipsCarousel() {
  return <SharedTipsCarousel tips={tips} />;
}