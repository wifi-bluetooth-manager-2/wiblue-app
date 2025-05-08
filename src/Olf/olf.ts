type TData = string | Object;
type TPutData = string | Object | undefined;
type THeaders = HeadersInit | undefined;

export class OneLastError {
  public title: string = "";
  public error: string = "";
  public status: number = 200;

  constructor(errorText: string, status: number) {
    this.title = "OneLastFetch went wrong";
    this.error = errorText;
    this.status = status;
  }

  toString() {
    return JSON.stringify({ title: this.title, error: this.error });
  }
}

export class OneLastFetch {
  private defaultHeaders = { "Content-Type": "application/json" };

  async get(endpointUrl: string, headers: THeaders = undefined) {
    try {
      const response = await fetch(endpointUrl, {
        method: "GET",
        headers: headers
          ? new Headers(headers)
          : new Headers(this.defaultHeaders),
      });

      if (!response.ok) {
        throw new Error("OneLastGet went wrong");
      }

      return await response.json();
    } catch (error) {
      console.error("OneLastGet error: ", error);
      throw error; // Propagate the error to the caller
    }
  }

  async post(endpointUrl: string, data: TData, headers: THeaders = undefined) {
    if (data != undefined) {
      const response = await fetch(endpointUrl, {
        method: "POST",
        headers: headers
          ? new Headers(headers)
          : new Headers(this.defaultHeaders),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorText = await response.text();
        if (response.status == 502) {
          throw new Error("502");
        }
        throw new OneLastError(errorText, response.status).toString();
        // throw new Error(`OneLastPost went wrong (${errorText}})`);
      }
      return await response.json();
    }
    const response = await fetch(endpointUrl, {
      method: "POST",
      headers: this.defaultHeaders,
    });

    if (!response.ok)
      throw new OneLastError(
        "Onelastpost went wrong",
        response.status,
      ).toString();
    return await response.json();
  }

  async put(
    endpointUrl: string,
    data: TPutData = undefined,
    headers: THeaders = undefined,
  ) {
    let response;
    if (data == undefined) {
      response = await fetch(endpointUrl, {
        method: "PUT",
        headers: headers
          ? new Headers(headers)
          : new Headers(this.defaultHeaders),
      });
    } else {
      response = await fetch(endpointUrl, {
        method: "PUT",
        headers: headers
          ? new Headers(headers)
          : new Headers(this.defaultHeaders),
        body: JSON.stringify({ data }),
      });
    }

    if (!response.ok) {
      const errorText = await response.text();
      //      throw { title: "OneLastPut went wrong", error: errorText };
      throw new OneLastError(errorText, response.status).toString();
    }
    return await response.json();
  }

  async delete(
    endpointUrl: string,
    data: TData,
    headers: THeaders = undefined,
  ) {
    const response = await fetch(endpointUrl, {
      method: "DELETE",
      headers: headers
        ? new Headers(headers)
        : new Headers(this.defaultHeaders),
      body: JSON.stringify({ data }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OneLastDelete went wrong (${errorText})`);
    }
    return await response.json();
  }
}

const OLF = new OneLastFetch();
export default OLF;
