import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.AUTH_SECRET,
  pages: { signIn: '/login' },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id     = user.id
        token.rol    = (user as any).rol
        token.nombre = (user as any).nombre
      }
      return token
    },
    session({ session, token }) {
      session.user.id = token.id as string
      ;(session.user as any).rol    = token.rol
      ;(session.user as any).nombre = token.nombre
      return session
    },
  },
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsed = z.object({
          email:    z.string().email(),
          password: z.string().min(1),
        }).safeParse(credentials)

        if (!parsed.success) return null

        const usuario = await prisma.usuario.findUnique({
          where: { email: parsed.data.email, activo: true },
        })
        if (!usuario || !usuario.passwordHash) return null

        const ok = await bcrypt.compare(parsed.data.password, usuario.passwordHash)
        if (!ok) return null

        return {
          id:     String(usuario.id),
          email:  usuario.email,
          name:   usuario.nombre,
          rol:    usuario.rol,
          nombre: usuario.nombre,
        }
      },
    }),
  ],
})
