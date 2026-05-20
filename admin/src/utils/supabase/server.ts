export async function createClient() {
  const mockClient = {
    auth: {
      async getUser() {
        return { data: { user: null }, error: null };
      },
      async getSession() {
        return { data: { session: null }, error: null };
      }
    },
    from(tableName: string) {
      let filters: any = {};
      let order: any = null;

      const chain = {
        select(columns: string = '*') {
          return this;
        },
        eq(column: string, value: any) {
          filters[column] = value;
          return this;
        },
        order(field: string, options: { ascending?: boolean } = {}) {
          order = {
            field,
            direction: options.ascending === false ? 'desc' : 'asc'
          };
          return this;
        },
        single() {
          filters._single = true;
          return this;
        },
        maybeSingle() {
          filters._single = true;
          return this;
        },
        limit(val: number) {
          return this;
        },
        async then(onfulfilled?: (value: any) => any) {
          try {
            const { dispatchDbQuery } = require('@/utils/db-dispatcher');
            const result = await dispatchDbQuery(tableName, 'select', undefined, filters, order);
            const payload = { data: result, error: null };
            if (onfulfilled) return onfulfilled(payload);
            return payload;
          } catch (error: any) {
            const errPayload = { data: null, error: { message: error.message } };
            if (onfulfilled) return onfulfilled(errPayload);
            return errPayload;
          }
        },
        async insert(data: any) {
          try {
            const { dispatchDbQuery } = require('@/utils/db-dispatcher');
            const result = await dispatchDbQuery(tableName, 'insert', data, undefined, undefined);
            return { data: result, error: null };
          } catch (error: any) {
            return { data: null, error: { message: error.message } };
          }
        },
        update(data: any) {
          return {
            async eq(column: string, value: any) {
              filters[column] = value;
              try {
                const { dispatchDbQuery } = require('@/utils/db-dispatcher');
                const result = await dispatchDbQuery(tableName, 'update', data, filters, undefined);
                return { data: result, error: null };
              } catch (error: any) {
                return { data: null, error: { message: error.message } };
              }
            }
          };
        },
        delete() {
          return {
            async eq(column: string, value: any) {
              filters[column] = value;
              try {
                const { dispatchDbQuery } = require('@/utils/db-dispatcher');
                const result = await dispatchDbQuery(tableName, 'delete', undefined, filters, undefined);
                return { data: result, error: null };
              } catch (error: any) {
                return { data: null, error: { message: error.message } };
              }
            }
          };
        }
      };
      return chain;
    }
  };

  return mockClient as any;
}
