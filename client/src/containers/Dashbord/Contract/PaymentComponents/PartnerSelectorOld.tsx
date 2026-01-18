import * as React from "react";
import { Autocomplete as AutocompletePrimitive } from "@base-ui-components/react/autocomplete";
import { LoaderCircleIcon } from "lucide-react";
import { handleAcessToken } from "@/fetch/fetchWrapper";

import {
  Autocomplete,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteList,
  AutocompletePopup,
  AutocompleteStatus,
} from "@/components/ui/autocomplete";
import { set } from "zod";

type User = {
  name: string;
  id: number;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
};
// const top100Movies: Movie[] = [
//   { id: "1", title: "The Shawshank Redemption", year: 1994 },
//   { id: "2", title: "The Godfather", year: 1972 },
//   { id: "3", title: "The Dark Knight", year: 2008 },
//   { id: "4", title: "The Godfather Part II", year: 1974 },
//   { id: "5", title: "12 Angry Men", year: 1957 },
//   { id: "8", title: "Pulp Fiction", year: 1994 },
//   { id: "11", title: "Forrest Gump", year: 1994 },
//   { id: "14", title: "Inception", year: 2010 },
// ];

async function getUsers(name: string, token: string) {
  try {
    const response = await fetch(
      "http://localhost:3000/user/searchByUsername",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: name }),
      }
    );

    const users = await response.json();

    return users;
  } catch (error) {
    console.log("Error fetching users:", error);
  }
}

async function searchUsers(name: string) {
  //   await new Promise((resolve) =>
  //     setTimeout(resolve, Math.random() * 500 + 100)
  //   );
  //   if (Math.random() < 0.01 || query === "will_error") {
  //     throw new Error("Network error");
  //   }
  //   return top100Movies.filter(
  //     (movie) =>
  //       filter(movie.title, query) || filter(movie.year.toString(), query)
  //   );

  console.log("Searching users with name:", name);

  const users = await handleAcessToken(getUsers.bind(null, name));

  if (!users) {
    throw new Error("No users found");
  }

  console.log("Fetched users:", users);
  return users as User[];
}

export default function PartnerSelectorOld() {
  const [searchValue, setSearchValue] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [searchResults, setSearchResults] = React.useState<User[]>([]);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!searchValue) {
      setSearchResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    let ignore = false;

    const timeoutId = setTimeout(async () => {
      try {
        const results = await searchUsers(searchValue);
        if (!ignore) setSearchResults(results);
      } catch (err) {
        if (!ignore) {
          setError("Failed to fetch movies. Please try again.");
          setSearchResults([]);
        }
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }, 300);

    return () => {
      clearTimeout(timeoutId);
      ignore = true;
    };
  }, [searchValue]);

  let status: React.ReactNode = `${searchResults.length} result${
    searchResults.length === 1 ? "" : "s"
  } found`;
  if (isLoading) {
    status = (
      <span className="flex items-center justify-between gap-2 text-muted-foreground">
        Searching...
        <LoaderCircleIcon className="size-4 animate-spin" aria-hidden />
      </span>
    );
  } else if (error) {
    status = (
      <span className="text-sm font-normal text-destructive">{error}</span>
    );
  } else if (searchResults.length === 0 && searchValue) {
    status = (
      <span className="text-sm font-normal text-muted-foreground">
        User "{searchValue}" does not exist
      </span>
    );
  }

  const shouldRenderPopup = searchValue !== "";

  return (
    <Autocomplete
      items={searchResults}
      value={searchValue}
      onValueChange={setSearchValue}
      itemToStringValue={(item: unknown) => (item as User).name}
      filter={null}
    >
      <AutocompleteInput placeholder="e.g. Pulp Fiction or 1994" />
      {shouldRenderPopup && (
        <AutocompletePopup aria-busy={isLoading || undefined}>
          <AutocompleteStatus className="text-muted-foreground">
            {status}
          </AutocompleteStatus>
          <AutocompleteList>
            {(user: User) => (
              <AutocompleteItem key={user.id} value={user as User}>
                <div className="flex w-full flex-col gap-1 ">
                  <div className="font-medium">{user.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {user.email}
                  </div>
                </div>
              </AutocompleteItem>
            )}
          </AutocompleteList>
        </AutocompletePopup>
      )}
    </Autocomplete>
  );
}
