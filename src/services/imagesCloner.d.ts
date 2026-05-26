import type { Ref } from 'vue';

export interface ImagenClonezillaRow {
  nombreImagen: string;
  estado: 'DESACTIVADA' | 'PENDIENTE' | 'ACTIVADA';
  accion?: 'poweroff' | 'reboot' | string | null;
}

export declare const listarImagenesClonezilla: (
  toastMessage: Ref<string>,
  toastColor: Ref<string>,
  isToastOpen: Ref<boolean>
) => Promise<ImagenClonezillaRow[]>;

export declare const establecerImagenPorDefecto: (
  toastMessage: Ref<string>,
  toastColor: Ref<string>,
  isToastOpen: Ref<boolean>,
  nombreImagen: string,
  accion: 'poweroff' | 'reboot'
) => Promise<ImagenClonezillaRow[]>;

export declare const habilitarMenuCompletoClonezilla: (
  toastMessage: Ref<string>,
  toastColor: Ref<string>,
  isToastOpen: Ref<boolean>
) => Promise<ImagenClonezillaRow[]>;
