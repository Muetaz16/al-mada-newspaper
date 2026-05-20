let client: any = null;

export function createClient() {
  if (typeof window === 'undefined') {
    // Return server-side compatible dispatcher-based mock client
    return createMockClient(true);
  }

  if (!client) {
    client = createMockClient(false);
  }

  return client;
}

function createMockClient(isServerSide: boolean) {
  const mockClient = {
    auth: {
      async getUser() {
        if (isServerSide) {
          return { data: { user: null }, error: null };
        }
        try {
          const res = await fetch('/api/auth/me');
          if (res.ok) {
            const { user } = await res.json();
            return { data: { user }, error: null };
          }
        } catch (e) {}
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
            let payload: any;
            if (isServerSide) {
              const { dispatchDbQuery } = require('@/utils/db-dispatcher');
              const result = await dispatchDbQuery(tableName, 'select', undefined, filters, order);
              payload = { data: result, error: null };
            } else {
              const res = await fetch('/api/db', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  table: tableName,
                  action: 'select',
                  filters,
                  order
                })
              });
              payload = await res.json();
            }
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
            let payload: any;
            if (isServerSide) {
              const { dispatchDbQuery } = require('@/utils/db-dispatcher');
              const result = await dispatchDbQuery(tableName, 'insert', data, undefined, undefined);
              payload = { data: result, error: null };
            } else {
              const res = await fetch('/api/db', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  table: tableName,
                  action: 'insert',
                  data
                })
              });
              payload = await res.json();
            }
            return payload;
          } catch (error: any) {
            return { data: null, error: { message: error.message } };
          }
        },
        update(data: any) {
          return {
            async eq(column: string, value: any) {
              filters[column] = value;
              try {
                let payload: any;
                if (isServerSide) {
                  const { dispatchDbQuery } = require('@/utils/db-dispatcher');
                  const result = await dispatchDbQuery(tableName, 'update', data, filters, undefined);
                  payload = { data: result, error: null };
                } else {
                  const res = await fetch('/api/db', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      table: tableName,
                      action: 'update',
                      data,
                      filters
                    })
                  });
                  payload = await res.json();
                }
                return payload;
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
                let payload: any;
                if (isServerSide) {
                  const { dispatchDbQuery } = require('@/utils/db-dispatcher');
                  const result = await dispatchDbQuery(tableName, 'delete', undefined, filters, undefined);
                  payload = { data: result, error: null };
                } else {
                  const res = await fetch('/api/db', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      table: tableName,
                      action: 'delete',
                      filters
                    })
                  });
                  payload = await res.json();
                }
                return payload;
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
