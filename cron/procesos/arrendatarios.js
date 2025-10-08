module.exports = {
  name: 'cleanup-data',
  run: async ({ db }) => {
    // ejemplo con Mongoose:
    // await db.Logs.deleteMany({ createdAt: { $lt: subDays(new Date(), 30) } });
    // o con Prisma:
    // await db.log.deleteMany({ where: { createdAt: { lt: subDays(new Date(), 30) } } });
  },
};
