import { prisma } from '@/utils/prisma';

const getModel = (table: string): any => {
  switch (table) {
    case 'categories': return prisma.category;
    case 'news': return prisma.news;
    case 'polls': return prisma.poll;
    case 'poll_options': return prisma.pollOption;
    case 'videos': return prisma.video;
    case 'reels': return prisma.reel;
    case 'pulse_of_life': return prisma.pulseOfLife;
    case 'breaking_news': return prisma.breaking_news;
    case 'users': return prisma.user;
    case 'live_streams': return prisma.liveStream;
    case 'audio_recordings': return prisma.audioRecording;
    case 'programs': return prisma.program;
    default: return null;
  }
};

export async function dispatchDbQuery(
  table: string,
  action: string,
  data?: any,
  filters?: any,
  order?: any,
  limit?: number
) {
  const model = getModel(table);
  if (!model) {
    throw new Error(`Table '${table}' is not supported by the local Prisma proxy`);
  }

  let result: any = null;

  if (action === 'select') {
    const queryOptions: any = {};
    
    // Parse filters
    if (filters) {
      const cleanFilters = { ...filters };
      const isSingle = cleanFilters._single === true;
      delete cleanFilters._single;

      // Handle neq (not-equal) filters - stored as { _neq: value }
      const where: any = {};
      for (const [key, value] of Object.entries(cleanFilters)) {
        if (value && typeof value === 'object' && '_neq' in (value as any)) {
          where[key] = { not: (value as any)._neq };
        } else {
          where[key] = value;
        }
      }
      queryOptions.where = where;

      // Include options automatically for polls to fetch details
      if (table === 'polls') {
        queryOptions.include = { options: true };
      } else if (table === 'news') {
        queryOptions.include = { category: true };
      }

      // Parse order
      if (order) {
        queryOptions.orderBy = { [order.field]: order.direction };
      }

      // Parse limit
      if (limit && limit > 0) {
        queryOptions.take = limit;
      }

      if (isSingle) {
        result = await model.findFirst(queryOptions);
      } else {
        result = await model.findMany(queryOptions);
      }
    } else {
      if (table === 'polls') {
        queryOptions.include = { options: true };
      } else if (table === 'news') {
        queryOptions.include = { category: true };
      }
      if (order) {
        queryOptions.orderBy = { [order.field]: order.direction };
      }
      if (limit && limit > 0) {
        queryOptions.take = limit;
      }
      result = await model.findMany(queryOptions);
    }
  } else if (action === 'insert') {
    // Standardize data mappings if needed
    if (Array.isArray(data)) {
      result = await model.createMany({ data });
    } else {
      result = await model.create({ data });
    }
  } else if (action === 'update') {
    const cleanFilters = { ...filters };
    delete cleanFilters._single;

    // Handle single update vs updateMany
    if (cleanFilters.id) {
      result = await model.update({
        where: { id: cleanFilters.id },
        data,
      });
    } else {
      result = await model.updateMany({
        where: cleanFilters,
        data,
      });
    }
  } else if (action === 'delete') {
    const cleanFilters = { ...filters };
    delete cleanFilters._single;

    if (cleanFilters.id) {
      result = await model.delete({
        where: { id: cleanFilters.id },
      });
    } else {
      result = await model.deleteMany({
        where: cleanFilters,
      });
    }
  }

  return result;
}
