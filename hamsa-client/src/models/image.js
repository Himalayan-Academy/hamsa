import { mql } from "../mithril-graphql";

export const imageModel = {
    options: {
        url: "http://localhost:8080/"
    },
    getAvailableImages: function () {
        var query = `
        query {
            images {
                checksum
                path
                thumbnail
            }
        }
        `;

        var client = mql(this.options);

        return client
            .get(query)
            .then(response => response.data.images)

    }
};