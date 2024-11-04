Validação:

[] DataHora não está gravando - Está gravando porem ela grava realizando a sobrepozição do dado
[] DirVento retorna valor invalido
[] Gravação duplicada - todas - Verificar se a requisição está sendo chamada 2 vezes
[] Retorno dos valores de tags zerados,
[] Testar outro metodo de requisição,
[] Realizar agregação de data com valor de tag

- Maneira de vincular data da maneira correta

    Maneira 1:
        Realizar o cadastro padrão de cada valor, da maneira que a API atual faz
        Realiza a criação de um banco de dados próprio para cadastrar os dados de cada tag
        Realiza o consumo dos dados com seu respectivo relacionamento

    Passos:
        (Faça isso a cada 15 minutos)
        1° - realizar o cadastro de cada valor, referente a cada WebId
        2° - realizar o update de cada valor timestamp, refente a cada WebId
