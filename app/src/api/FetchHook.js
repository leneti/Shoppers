import { useEffect, useRef, useReducer } from "react";

// Usage: const { status, data, error } = useFetch(url);
// status === 'idle' | 'error' | 'fetching' | 'fetched'

/**
 * Fetches data from Nordigen
 * @param {{url: String, method: "POST"|"GET"|"PUT"|"DELETE", headers: {"Accept": String, "Authorization": String, "Content-Type": String}, body: String, shouldFetch: boolean}}
 * @returns {{status: 'idle' | 'error' | 'fetching' | 'fetched', error?: String, data: any}}
 */
export const useFetch = ({
  url,
  method,
  headers,
  body,
  shouldFetch = true,
}) => {
  const cache = useRef({});

  const initialState = {
    status: "idle",
    error: null,
    data: [],
  };

  const [state, dispatch] = useReducer((state, action) => {
    switch (action.type) {
      case "FETCHING":
        return { ...initialState, status: "fetching" };
      case "FETCHED":
        return { ...initialState, status: "fetched", data: action.payload };
      case "FETCH_ERROR":
        return { ...initialState, status: "error", error: action.payload };
      default:
        return state;
    }
  }, initialState);

  useEffect(() => {
    let cancelRequest = false;
    if (!url || !shouldFetch) return;

    const fetchData = async () => {
      dispatch({ type: "FETCHING" });
      if (cache.current[url]) {
        const data = cache.current[url];
        dispatch({ type: "FETCHED", payload: data });
      } else {
        try {
          const response = await fetch(url, { headers, method, body });
          const data = await response.json();
          cache.current[url] = data;
          if (cancelRequest) return;
          dispatch({ type: "FETCHED", payload: data });
        } catch (error) {
          if (cancelRequest) return;
          dispatch({ type: "FETCH_ERROR", payload: error.message });
        }
      }
    };

    fetchData();

    return function cleanup() {
      cancelRequest = true;
    };
  }, [url, shouldFetch]);

  return state;
};
