export const createClient = async () => {
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
      let limitVal: number | null = null;

      const chain = {
        select(columns: string = '*') {
          return this;
        },
        eq(column: string, value: any) {
          filters[column] = value;
          return this;
        },
        neq(column: string, value: any) {
          filters[column] = { _neq: value };
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
          limitVal = val;
          return this;
        },
        async then(onfulfilled?: (value: any) => any) {
          try {
            const adminUrl = process.env.ADMIN_API_URL || 'http://127.0.0.1:3000';
            const res = await fetch(`${adminUrl}/api/db`, {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                'x-api-token': process.env.API_SECRET_TOKEN || ''
              },
              body: JSON.stringify({
                table: tableName,
                action: 'select',
                filters,
                order,
                limit: limitVal
              })
            });
            const payload = await res.json();
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
            const adminUrl = process.env.ADMIN_API_URL || 'http://127.0.0.1:3000';
            const res = await fetch(`${adminUrl}/api/db`, {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                'x-api-token': process.env.API_SECRET_TOKEN || ''
              },
              body: JSON.stringify({
                table: tableName,
                action: 'insert',
                data
              })
            });
            return await res.json();
          } catch (error: any) {
            return { data: null, error: { message: error.message } };
          }
        },
        update(data: any) {
          return {
            async eq(column: string, value: any) {
              filters[column] = value;
              try {
                const adminUrl = process.env.ADMIN_API_URL || 'http://127.0.0.1:3000';
                const res = await fetch(`${adminUrl}/api/db`, {
                  method: 'POST',
                  headers: { 
                    'Content-Type': 'application/json',
                    'x-api-token': process.env.API_SECRET_TOKEN || ''
                  },
                  body: JSON.stringify({
                    table: tableName,
                    action: 'update',
                    data,
                    filters
                  })
                });
                return await res.json();
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
                const adminUrl = process.env.ADMIN_API_URL || 'http://127.0.0.1:3000';
                const res = await fetch(`${adminUrl}/api/db`, {
                  method: 'POST',
                  headers: { 
                    'Content-Type': 'application/json',
                    'x-api-token': process.env.API_SECRET_TOKEN || ''
                  },
                  body: JSON.stringify({
                    table: tableName,
                    action: 'delete',
                    filters
                  })
                });
                return await res.json();
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
};
