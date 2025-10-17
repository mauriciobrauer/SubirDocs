# ⚡ Deploy Rápido en Vercel

## 🚀 Pasos para Deploy Inmediato

### 1. Conectar a Vercel (2 minutos)

1. Ve a [vercel.com](https://vercel.com) y haz login
2. Click en **"New Project"**
3. Importa el repositorio: `mauriciobrauer/SubirDocs`
4. Framework: **Next.js** (detectado automáticamente)

### 2. Configurar Variables de Entorno (1 minuto)

En el dashboard de Vercel:
1. Ve a **Settings** → **Environment Variables**
2. Agrega estas variables:

```
DROPBOX_ACCESS_TOKEN = sl.u.AGBFJvXM1MKNBtzfZAnOhzzoij21mP9X4ImND-ivedDA5k1bjqMA47AF33Ay96BK5bGYhK9HjOeDNogJvEGEfVI7ETgJAvpJ8MbNO6Jk9zH7oEZlGGPL7JXwyPpEEapQi1_Z5uLaKZs9Kn2m3VjIMDOV07e4mgya49waQociiHvppArsBzeRHc5Qv0U4i5fwY4lhaznw_3-CkIY-CSfZN0wCFA2Zru399Ic8AK-DfYnCd1Rm4mnqmxG16cGguwPLhmE15H4EpaQ_wYPJROncQwbsO1yEPGDMCNbEbpfVQaQcKDzAWbJRKnoUJfE4VUCb010RBA7d2zwCmqeq1EWxof-UjH4yU__NeY_t742chs9GfgwhwAXUFZ8IvOdZDC2gj11yXcb6Cs75k0ut1aNCrRtONM1SLMp2GSN3auRV5H9y-CDB5hV_p-RNunMMvjzdZ2bj06x0ZWPeS3VMxhD0Vd70-omBlkWn_jMab3P3osuJLmfpkc27NBKPedsVX9D9SVvAm6wQFsGoXIg2z79N1nsKvyDQt5PnSPGe-fsIUbrzF1QF9gADoY7za-h1sjKZd9XhVVlDKuSnIg6vI47ZFUnqJJyvg1-fH7IVEUj5swlzp0lu_QTLQ5MWffyz4Zwo_3o3VYukr7Pf772mblApMUZ_bBc_zEF14J_DqnjcyArNcNn91_IBAXRwRbv4I17-QtQZyKC2-PVGMU7CTIZM-FE1wcrw0ns-5-RkRBrVHID9EeOtsibHgfLbvvN1Uplk_MLf1GABnqYbtHrOceYisEuU0n4QMvHgP04YhLUHjeD5cijh0bWdtkcTCZIBnRvo3cGjWSupE2FFV0pUiR4sxpps8RtSb0dPZubqKibFal0M4qiUUp16FA63EAHttpJqTc_Jvu-LgMpGTp-_RGB3k71VP1ue43pDQ65wrUtXYWmNSz-Z2zWfX0G_ToOoGtdTcmroNDfptUz2EKL75UnRv5NHDNIvDI6qHbDfa4f_d4FDCFTw6k2ixcimYNQPe4xdVsOTh7Iu_gJkoDzf3945XCJOqLu3kti4rlcADnAUox9u1QMhopIN7HINIhizvN1rnSjHZC7QmG2_FxhR4XnqrdKy3tgdpAMK-NwLrNtVRUZDjtAWn6oFvGgFcCsCLLPmhTFH0ihgc7Jahz-5PS3rWdGnWqsLkOyCJ230AI75pfmjXGrUyrirZfNcvfC5539kWO5VMf60WFuilMDIwEPvioxRxhTheJp-qhIM1zYf-crIpqL6DyjdHr2z74nAZYGK71ikE4Crq5cGtKy5L7ue-yRE_Z14BBaobmpWOcLqBwwyoQ

NEXT_PUBLIC_APP_NAME = GuardarPDF Dropbox
```

### 3. Deploy (1 minuto)

1. Click en **"Deploy"**
2. Espera 2-3 minutos
3. ¡Listo! Tu app estará en `https://tu-proyecto.vercel.app`

## ✅ Verificación Post-Deploy

### Usuarios de Prueba:
- **María García** (maria.garcia@empresa.com)
- **Carlos Rodríguez** (carlos.rodriguez@empresa.com)  
- **Ana Martínez** (ana.martinez@empresa.com)
- **David López** (david.lopez@empresa.com)

### Funcionalidades a Probar:
1. ✅ Login con cualquiera de los 4 usuarios
2. ✅ Subir archivo PDF o DOC
3. ✅ Ver lista de archivos
4. ✅ Copiar enlaces compartidos
5. ✅ Ver archivos en Dropbox

## 🐛 Si Algo Sale Mal

### Error: "DROPBOX_ACCESS_TOKEN is required"
- Verifica que la variable esté en Environment Variables
- Asegúrate de que el valor sea el token completo

### Error: "Build failed"
- Revisa los logs en Vercel
- Verifica que todas las dependencias estén en package.json

### Error: "Function timeout"
- El timeout está configurado en 30s
- Para archivos muy grandes, considera optimizar

## 📱 URLs Importantes

- **Dashboard Vercel**: [vercel.com/dashboard](https://vercel.com/dashboard)
- **Repositorio**: [github.com/mauriciobrauer/SubirDocs](https://github.com/mauriciobrauer/SubirDocs)
- **Dropbox Console**: [dropbox.com/developers/apps](https://www.dropbox.com/developers/apps)

---

**⏱️ Tiempo total estimado: 5 minutos**

¡Tu aplicación estará funcionando en producción! 🎉
