import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// La barra de URL movil cambia de alto sin que cambie el layout real: sin esto
// cada movimiento dispara un refresh completo de los pins (medidas + spacers).
ScrollTrigger.config({ ignoreMobileResize: true });

export { gsap, ScrollTrigger };
