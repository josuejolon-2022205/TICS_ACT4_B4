# Mini App — Catálogo de Productos

Mini aplicación que consume la [Fake Store API](https://fakestoreapi.com/) con `fetch()`,
muestra los productos dinámicamente y permite buscar por nombre y filtrar por categoría.
Incluye control de calidad de código con **ESLint** y un hook de **pre-commit** vía **Husky**,
gestionado con **pnpm**.

## Archivos base

- `index.html` — estructura de la página
- `style.css` — estilos
- `script.js` — lógica: fetch a la API, render dinámico, búsqueda y filtro

## Funcionalidad

- Obtiene productos desde `https://fakestoreapi.com/products`.
- Renderiza cada producto como una tarjeta (imagen, título, categoría, precio).
- Barra de búsqueda por texto (filtra por título).
- Selector de categoría (se llena dinámicamente con las categorías reales de la API).

## Pasos seguidos para configurar Git, Husky y ESLint

```bash
# 1. Inicializar el repositorio
git init

# 2. Instalar dependencias de desarrollo
pnpm add husky eslint lint-staged --save-dev

# 3. Inicializar Husky (crea la carpeta .husky y agrega el script "prepare")
pnpm husky init

# 4. Reemplazar el contenido por defecto de .husky/pre-commit
#    (por defecto trae "npm test", que no existe en este proyecto)
#    .husky/pre-commit debe contener:
#    pnpm exec lint-staged

# 5. Configurar ESLint (ya incluido en eslint.config.js, formato flat config)

# 6. Probar el lint manualmente
pnpm exec eslint .
```

## Cómo funciona el pre-commit

`lint-staged` (configurado en `package.json`) ejecuta `eslint --fix` solo sobre los
archivos `.js` que están en stage. El hook `.husky/pre-commit` llama a `lint-staged`
en cada `git commit`. Si ESLint encuentra errores que no puede corregir automáticamente,
el commit se **bloquea** hasta que se corrijan.

## Proceso real seguido (con tropiezos incluidos)

1. **`git init`** — se creó el repositorio local sin problema.
2. **`git add .gitignore` + primer commit** — funcionó, pero mostró
   `"No staged files match any configured task"`, porque `.gitignore` no es un
   archivo `.js` y por lo tanto `lint-staged` no tenía nada que revisar en ese commit.
3. **`pnpm husky init`** sobrescribió `.husky/pre-commit` con el comando de ejemplo
   `npm test`. Al hacer commit, esto falló con:
   ```
   npm error Missing script: "test"
   husky - pre-commit script failed (code 1)
   ```
   Se corrigió reemplazando el contenido del hook por `pnpm exec lint-staged`.
4. Se agregó `script.js` y se hizo commit cambiando `let` por `var`. **Este commit
   pasó**, porque la configuración de ESLint no incluye la regla `no-var` y
   `prefer-const` está en nivel `"warn"` (las advertencias no bloquean el commit,
   solo los errores).
5. Para forzar un error real de nivel `"error"`, se cambió una comparación de
   `===` a `==` (viola la regla `eqeqeq`). Al intentar el commit:
   ```
   ✖ eslint --fix:
   script.js
     33:23  error  Expected '===' and instead saw '=='  eqeqeq
   ✖ 1 problem (1 error, 0 warnings)
   husky - pre-commit script failed (code 1)
   ```
   El commit **no se creó** — lint-staged revirtió los cambios al estado original.
6. Se corrigió el `==` de vuelta a `===`, se repitió `git add` y `git commit`, y esta
   vez el commit se completó sin errores.

### Verificación de bloqueo (resumen)

1. Introducir un error deliberado en `script.js` que viole una regla `"error"`
   (por ejemplo `==` en vez de `===`, ya que `no-var` no está configurada como error).
2. Agregar el archivo al stage: `git add script.js`
3. Intentar el commit: `git commit -m "prueba"`
4. Husky debe detener el commit y mostrar el error de ESLint en consola.
5. Corregir el error, repetir `git add` y `git commit` — el commit debe completarse.

## Notas

- Se usó `eslint.config.js` (formato "flat config"), el estándar en versiones recientes de ESLint.
- Se usó `pnpm` en vez de `npm`; el lockfile es `pnpm-lock.yaml`.
- El proyecto no requiere backend ni build step: `index.html` puede abrirse directamente
  o servirse con una extensión como Live Server en VS Code.
- Si se quiere que hasta los *warnings* de ESLint bloqueen el commit, cambiar en
  `package.json` la config de lint-staged a `"*.js": "eslint --fix --max-warnings=0"`.